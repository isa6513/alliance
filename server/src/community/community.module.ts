import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from './entities/community.entity';
import { CommunityInvite } from './entities/community-invite.entity';
import { CommunityService } from './community.service';

@Module({
  imports: [TypeOrmModule.forFeature([Community, CommunityInvite])],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
