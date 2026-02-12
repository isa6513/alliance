import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLog } from './event-log.entity';
import { EventLogService } from './eventlog.service';
import { EventLogController } from './eventlog.controller';
import { EventLogGateway } from './eventlog.gateway';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventLog, User]), forwardRef(() => UserModule)],
  controllers: [EventLogController],
  providers: [EventLogService, EventLogGateway],
  exports: [EventLogService],
})
export class EventLogModule { }
