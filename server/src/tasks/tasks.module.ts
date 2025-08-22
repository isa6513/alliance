import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Form } from './entities/form.entity';
import { FormResponse } from './entities/formresponse.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Form, FormResponse]), UserModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
