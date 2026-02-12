import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mms } from './mms.entity';
import { MmsService } from './mms.service';
import { TwilioStatusWorker } from './twiliostatus.worker';
import { EventLogModule } from 'src/eventlog/eventlog.module';
import { MmsController } from './mms.controller';
import { MmsUnsubService } from './mms-unsub.service';
import { MmsOptout } from './mms-optout.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mms, MmsOptout, User]), EventLogModule],
  providers: [MmsService, TwilioStatusWorker, MmsUnsubService],
  controllers: [MmsController],
  exports: [MmsService],
})
export class MmsModule { }
