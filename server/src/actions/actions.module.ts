import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/forum/entities/comment.entity';
import { EditableContent } from 'src/forum/entities/editablecontent.entity';
import { MailModule } from 'src/mail/mail.module';
import { MmsModule } from 'src/mms/mms.module';
import { ActionEventNotifWorker } from 'src/notifs/action-event-notif.worker';
import { ActionEventRecipientService } from 'src/notifs/action-event-recipient.service';
import { ActionEventReminderService } from 'src/notifs/action-event-reminder.service';
import { ActionEventNotif } from 'src/notifs/entities/action-event-notif.entity';
import { NotifsModule } from 'src/notifs/notifs.module';
import { User } from '../user/entities/user.entity';
import { Group } from '../user/entities/group.entity';
import { UserModule } from '../user/user.module';
import { ActionsController } from './actions.controller';
import { ActionsGateway } from './actions.gateway';
import { ActionsService } from './actions.service';
import { ActionActivity } from './entities/action-activity.entity';
import { ActionEvent } from './entities/action-event.entity';
import { Action } from './entities/action.entity';
import { ForumModule } from 'src/forum/forum.module';
import { ActionReminder } from './entities/action-reminder.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Action]),
    TypeOrmModule.forFeature([ActionEvent]),
    TypeOrmModule.forFeature([ActionReminder]),
    TypeOrmModule.forFeature([ActionActivity]),
    TypeOrmModule.forFeature([Comment]),
    TypeOrmModule.forFeature([EditableContent]),
    TypeOrmModule.forFeature([ActionEventNotif]),
    TypeOrmModule.forFeature([Group]),
    UserModule,
    NotifsModule,
    MailModule,
    MmsModule,
    ForumModule,
  ],
  controllers: [ActionsController],
  providers: [
    ActionsService,
    ActionsGateway,
    ActionEventNotifWorker,
    ActionEventRecipientService,
    ActionEventReminderService,
  ],
  exports: [ActionsService],
})
export class ActionsModule {}
