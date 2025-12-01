import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { ConversationService } from './conversation.service';
import { MessagingEvents } from './messaging.events';
import { MessageDto } from './dto/messaging.dto';
import { JwtPayload } from 'src/auth/guards/auth.guard';
import { extractTokenFromSocket } from './gateway.utils';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/messaging',
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingGateway.name);
  private readonly clientRooms = new Map<string, Set<number>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly conversationService: ConversationService,
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

  async handleConnection(client: Socket) {
    try {
      const token = extractTokenFromSocket(client);
      if (!token) {
        this.logger.warn('Missing token for messaging gateway connection.');
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.userId = payload.sub;
      this.clientRooms.set(client.id, new Set());
    } catch (error) {
      this.logger.warn(`Messaging gateway auth failed: ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.clientRooms.delete(client.id);
  }

  @SubscribeMessage('join-conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const conversationId = Number(data?.conversationId);
    if (!conversationId || Number.isNaN(conversationId)) {
      client.emit('messaging:error', { message: 'Invalid conversation id.' });
      return;
    }

    const userId = client.data.userId as number | undefined;
    if (!userId) {
      client.emit('messaging:error', { message: 'Unauthorized.' });
      client.disconnect(true);
      return;
    }

    const allowed = await this.conversationService.isParticipant(
      conversationId,
      userId,
    );
    if (!allowed) {
      client.emit('messaging:error', { message: 'Access denied.' });
      return;
    }

    client.join(this.roomName(conversationId));
    this.trackClientRoom(client.id, conversationId);
    client.emit('conversation-joined', { conversationId });
  }

  @SubscribeMessage('leave-conversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const conversationId = Number(data?.conversationId);
    if (!conversationId || Number.isNaN(conversationId)) {
      client.emit('messaging:error', { message: 'Invalid conversation id.' });
      return;
    }

    client.leave(this.roomName(conversationId));
    this.untrackClientRoom(client.id, conversationId);
    client.emit('conversation-left', { conversationId });
  }

  private handleMessageCreated(payload: {
    conversationId: number;
    message: MessageDto;
  }) {
    this.server
      .to(this.roomName(payload.conversationId))
      .emit('message:new', payload.message);
  }

  private handleConversationUpdated(payload: { conversationId: number }) {
    const room = this.roomName(payload.conversationId);
    void this.server
      .in(room)
      .fetchSockets()
      .then(async (sockets) => {
        for (const socket of sockets) {
          const userId = socket.data.userId as number | undefined;
          if (!userId) {
            continue;
          }
          try {
            const conversation =
              await this.conversationService.getConversationForUser(
                payload.conversationId,
                userId,
              );
            socket.emit('conversation:updated', conversation);
          } catch (error) {
            this.logger.warn(
              `Failed to build conversation dto for socket ${socket.id}: ${error.message}`,
            );
          }
        }
      });
  }

  private trackClientRoom(clientId: string, conversationId: number) {
    const rooms = this.clientRooms.get(clientId) ?? new Set<number>();
    rooms.add(conversationId);
    this.clientRooms.set(clientId, rooms);
  }

  private untrackClientRoom(clientId: string, conversationId: number) {
    const rooms = this.clientRooms.get(clientId);
    if (!rooms) {
      return;
    }

    rooms.delete(conversationId);
    if (!rooms.size) {
      this.clientRooms.delete(clientId);
    } else {
      this.clientRooms.set(clientId, rooms);
    }
  }

  private roomName(conversationId: number) {
    return `conversation:${conversationId}`;
  }
}
