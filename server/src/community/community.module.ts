import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from './entities/community.entity';
import { CommunityInvite } from './entities/community-invite.entity';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { ImagesModule } from 'src/images/images.module';
import { MessagingModule } from 'src/messaging/messaging.module';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { NotifsModule } from 'src/notifs/notifs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Community, CommunityInvite, User]),
    ImagesModule,
    forwardRef(() => MessagingModule),
    forwardRef(() => NotifsModule),
    forwardRef(() => UserModule),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
