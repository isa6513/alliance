import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from './entities/community.entity';
import { CommunityInvite } from './entities/community-invite.entity';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { ImagesModule } from 'src/images/images.module';
import { MessagingModule } from 'src/messaging/messaging.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Community, CommunityInvite]),
    forwardRef(() => UserModule),
    ImagesModule,
    forwardRef(() => MessagingModule),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
