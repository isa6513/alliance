import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Push } from './push.entity';
import { UserDevice } from 'src/user/entities/user-device.entity';
import { NotifPushDispatcherWorker } from './notif-push-dispatcher.worker';
import { Notification } from 'src/notifs/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Push, UserDevice, Notification])],
  providers: [PushService, NotifPushDispatcherWorker],
  exports: [PushService],
})
export class PushModule {}
