import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from 'src/actions/entities/action.entity';
import { UserModule } from 'src/user/user.module';
import { Form } from './entities/form.entity';
import { FormResponse } from './entities/formresponse.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ForumModule } from 'src/forum/forum.module';
import { ActionsModule } from 'src/actions/actions.module';
import { MmsModule } from 'src/mms/mms.module';
import { CustomValidator } from './entities/customvalidator.entity';
import { ActionShareUrl } from 'src/actions/entities/action-share-url.entity';
import { EventLogModule } from 'src/eventlog/eventlog.module';
import { VideosModule } from 'src/videos/videos.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Form,
      FormResponse,
      Action,
      CustomValidator,
      ActionShareUrl,
      User,
    ]),
    UserModule,
    ForumModule,
    ActionsModule,
    MmsModule,
    EventLogModule,
    VideosModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule { }
