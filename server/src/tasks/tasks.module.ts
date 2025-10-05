import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from 'src/actions/entities/action.entity';
import { UserModule } from 'src/user/user.module';
import { Form } from './entities/form.entity';
import { FormResponse } from './entities/formresponse.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ForumModule } from 'src/forum/forum.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Form, FormResponse, Action]),
    UserModule,
    ForumModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
