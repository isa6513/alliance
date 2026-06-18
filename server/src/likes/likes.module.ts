import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../forum/entities/comment.entity';
import { ForumModule } from '../forum/forum.module';
import { User } from '../user/entities/user.entity';
import { LikeOrderFunctionService } from './like-order-function.service';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Comment]), ForumModule],
  controllers: [LikesController],
  providers: [LikesService, LikeOrderFunctionService],
})
export class LikesModule {}
