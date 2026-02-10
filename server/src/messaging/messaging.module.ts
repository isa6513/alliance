import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/entities/community.entity';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Participant } from './entities/participant.entity';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessagingGateway } from './messaging.gateway';
import { ImagesModule } from 'src/images/images.module';
import { MessagingOverviewGateway } from './messaging.overview.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      Participant,
      Community,
      User,
    ]),
    forwardRef(() => UserModule),
    ImagesModule,
  ],
  controllers: [ConversationController, MessageController],
  providers: [
    ConversationService,
    MessageService,
    MessagingGateway,
    MessagingOverviewGateway,
  ],
  exports: [ConversationService],
})
export class MessagingModule {}
