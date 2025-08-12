import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller';
import { ActionsGateway } from './actions.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from './entities/action.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/user.entity';
import { UserAction } from './entities/user-action.entity';
import { ActionEvent } from './entities/action-event.entity';
import { ActionActivity } from './entities/action-activity.entity';
import { Comment } from 'src/forum/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Action]),
    TypeOrmModule.forFeature([UserAction]),
    TypeOrmModule.forFeature([ActionEvent]),
    TypeOrmModule.forFeature([ActionActivity]),
    TypeOrmModule.forFeature([Comment]),
    UserModule,
  ],
  controllers: [ActionsController],
  providers: [ActionsService, ActionsGateway],
  exports: [ActionsService],
})
export class ActionsModule {}
