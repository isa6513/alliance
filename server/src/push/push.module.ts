import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Push } from './push.entity';
import { UserDevice } from 'src/user/entities/user-device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Push, UserDevice])],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
