import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Notification } from '../notifs/entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { ActionActivity } from '../actions/entities/action-activity.entity';
import { EditableContent } from './entities/editablecontent.entity';
import { Action } from 'src/actions/entities/action.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      Comment,
      Notification,
      User,
      ActionActivity,
      EditableContent,
      Action,
    ]),
  ],
  controllers: [ForumController],
  providers: [ForumService],
  exports: [ForumService],
})
export class ForumModule {}
