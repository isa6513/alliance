import { Module } from '@nestjs/common';
import { EventLogService } from './eventlog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLog } from './event-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventLog])],
  providers: [EventLogService],
  exports: [EventLogService],
})
export class EventLogModule { }
