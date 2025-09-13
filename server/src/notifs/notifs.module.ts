import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { MmsModule } from 'src/mms/mms.module';
import { ActionEventNotif } from './entities/action-event-notif.entity';
import { Notification } from './entities/notification.entity';
import { NotifsController } from './notifs.controller';
import { NotifsService } from './notifs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, ActionEventNotif]),
    MailModule,
    MmsModule,
  ],
  controllers: [NotifsController],
  providers: [NotifsService],
  exports: [NotifsService],
})
export class NotifsModule {}
