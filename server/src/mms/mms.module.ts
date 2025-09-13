import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mms } from './mms.entity';
import { MmsService } from './mms.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mms])],
  providers: [MmsService],
  exports: [MmsService],
})
export class MmsModule {}
