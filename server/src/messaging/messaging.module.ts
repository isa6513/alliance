import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/user/entities/community.entity';
import { User } from 'src/user/entities/user.entity';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Participant } from './entities/participant.entity';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessagingGateway } from './messaging.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      Participant,
      Community,
      User,
    ]),
  ],
  controllers: [ConversationController, MessageController],
  providers: [ConversationService, MessageService, MessagingGateway],
  exports: [ConversationService],
})
export class MessagingModule {}
