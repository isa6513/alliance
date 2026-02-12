import { forwardRef, Module } from '@nestjs/common';
import { MmsModule } from 'src/mms/mms.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { ActionEventNotif } from './entities/action-event-notif.entity';
import { Notification } from './entities/notification.entity';
import { NotifsController } from './notifs.controller';
import { NotifsService } from './notifs.service';
import { LikeNotificationService } from './like-notification.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, ActionEventNotif, User]),
    MailModule,
    forwardRef(() => MmsModule),
    forwardRef(() => UserModule),
  ],
  controllers: [NotifsController],
  providers: [NotifsService, LikeNotificationService],
  exports: [NotifsService, LikeNotificationService],
})
export class NotifsModule { }
