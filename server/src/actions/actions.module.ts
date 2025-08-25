import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/forum/entities/comment.entity';
import { ActionEventNotifWorker } from 'src/notifs/action-event-notif.worker';
import { NotifsModule } from 'src/notifs/notifs.module';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { ActionsController } from './actions.controller';
import { ActionsGateway } from './actions.gateway';
import { ActionsService } from './actions.service';
import { ActionActivity } from './entities/action-activity.entity';
import { ActionEvent } from './entities/action-event.entity';
import { Action } from './entities/action.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Action]),
    TypeOrmModule.forFeature([ActionEvent]),
    TypeOrmModule.forFeature([ActionActivity]),
    TypeOrmModule.forFeature([Comment]),
    UserModule,
    NotifsModule,
  ],
  controllers: [ActionsController],
  providers: [ActionsService, ActionsGateway, ActionEventNotifWorker],
  exports: [ActionsService],
})
export class ActionsModule {}
