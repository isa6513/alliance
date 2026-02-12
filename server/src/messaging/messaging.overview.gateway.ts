import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import type { JwtPayload } from 'src/auth/guards/jwtreq';
import { MessagingEvents } from './messaging.events';
import { MessageDto } from './dto/messaging.dto';
import { ConversationService } from './conversation.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Participant } from './entities/participant.entity';
import type { Repository } from 'typeorm';
import { extractTokenFromSocket } from './gateway.utils';

interface MessageCreatedPayload {
  conversationId: number;
  message: MessageDto;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/messaging/overview',
})
export class MessagingOverviewGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingOverviewGateway.name);
  private readonly socketUsers = new Map<string, number>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly conversationService: ConversationService,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {
    this.eventEmitter.on(
      MessagingEvents.MessageCreated,
      this.handleMessageCreated.bind(this),
    );
    this.eventEmitter.on(
      MessagingEvents.ConversationUpdated,
      this.handleConversationUpdated.bind(this),
    );
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token = extractTokenFromSocket(client);
      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      const userId = payload.sub;
      client.data.userId = userId;
      this.socketUsers.set(client.id, userId);
      client.join(this.userRoom(userId));
    } catch (error) {
      this.logger.warn(
        `Messaging overview gateway auth failed: ${(error as Error).message ?? error
        }`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.socketUsers.delete(client.id);
  }

  private async handleMessageCreated(payload: MessageCreatedPayload) {
    const participants = await this.participantRepository.find({
      where: { conversation: { id: payload.conversationId } },
      relations: { user: true },
    });

    await Promise.all(
      participants.map(async (participant) => {
        const userId = participant.user?.id;
        if (!userId) {
          return;
        }

        try {
          const conversation =
            await this.conversationService.getConversationForUser(
              payload.conversationId,
              userId,
            );

          this.server.to(this.userRoom(userId)).emit('conversation:unread', {
            conversationId: payload.conversationId,
            unreadCount: conversation.unreadCount,
            lastMessage: payload.message,
            conversation,
          });
        } catch (error) {
          this.logger.warn(
            `Failed to emit unread update to user ${userId} for conversation ${payload.conversationId}: ${(error as Error).message ?? error
            }`,
          );
        }
      }),
    );
  }

  private async handleConversationUpdated(payload: { conversationId: number }) {
    const participants = await this.participantRepository.find({
      where: { conversation: { id: payload.conversationId } },
      relations: { user: true },
    });

    await Promise.all(
      participants.map(async (participant) => {
        const userId = participant.user?.id;
        if (!userId) return;
        try {
          const conversation =
            await this.conversationService.getConversationForUser(
              payload.conversationId,
              userId,
            );

          this.server.to(this.userRoom(userId)).emit('conversation:unread', {
            conversationId: payload.conversationId,
            unreadCount: conversation.unreadCount,
            conversation,
            lastMessage: conversation.lastMessage,
          });
        } catch (error) {
          this.logger.warn(
            `Failed to emit conversation update to user ${userId} for conversation ${payload.conversationId}: ${(error as Error).message ?? error
            }`,
          );
        }
      }),
    );
  }

  private userRoom(userId: number): string {
    return `user:${userId}`;
  }
}
