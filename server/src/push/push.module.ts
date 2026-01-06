import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [PushService],
  exports: [PushService],
  imports: [UserModule],
})
export class PushModule {}
