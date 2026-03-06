import { Module } from '@nestjs/common';
import { PushService, EXPO_CLIENT } from './push.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Push } from './push.entity';
import { UserDevice } from 'src/user/entities/user-device.entity';
import { NotifPushDispatcherWorker } from './notif-push-dispatcher.worker';
import { Notification } from 'src/notifs/entities/notification.entity';
import { Expo } from 'expo-server-sdk';

@Module({
  imports: [TypeOrmModule.forFeature([Push, UserDevice, Notification])],
  providers: [
    {
      provide: EXPO_CLIENT,
      useFactory: () =>
        new Expo({
          accessToken: process.env.EXPO_ACCESS_TOKEN,
          useFcmV1: true,
        }),
    },
    PushService,
    NotifPushDispatcherWorker,
  ],
  exports: [PushService],
})
export class PushModule {}
