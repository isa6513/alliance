import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { CommunityService } from './community.service';
import {
  CommunityDto,
  CommunityMemberDto,
  CreateCommunityDto,
  UpdateCommunityDto,
} from './dto/community.dto';
import { AuthGuard, JwtRequest } from 'src/auth/guards/auth.guard';
import { CommunityLeaderGuard } from 'src/auth/guards/communityleader.guard';
import { CommunityMemberContactInfoDto } from 'src/user/dto/user-action-relations.dto';
import {
  CommunityInviteDto,
  CreateCommunityInviteDto,
  RequestCommunityInviteDto,
} from 'src/user/dto/invite.dto';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('create/admin')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: CommunityDto })
  async createCommunityAdmin(
    @Body() body: CreateCommunityDto,
  ): Promise<CommunityDto> {
    return new CommunityDto(
      await this.communityService.createCommunityAdmin(body),
    );
  }

  @Post('create')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: CommunityDto })
  async createCommunity(
    @Request() req: JwtRequest,
    @Body() body: CreateCommunityDto,
  ): Promise<CommunityDto> {
    return new CommunityDto(
      await this.communityService.createCommunity(req.user.sub, body),
    );
  }

  @Get('list')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: [CommunityDto] })
  async getCommunitiesAdmin(): Promise<CommunityDto[]> {
    return (await this.communityService.findAllCommunities()).map(
      (community) => new CommunityDto(community),
    );
  }

  @Get('list/public')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: [CommunityDto] })
  async getPublicCommunities(): Promise<CommunityDto[]> {
    return (await this.communityService.findPublicCommunities()).map(
      (community) => new CommunityDto(community),
    );
  }

  @Get('list/my')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: CommunityDto, isArray: true })
  async getMyCommunities(@Request() req: JwtRequest): Promise<CommunityDto[]> {
    const communities = await this.communityService.findUserCommunities(
      req.user.sub,
    );
    return communities.map((community) => new CommunityDto(community));
  }

  @Post(':communityId/join')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: CommunityDto })
  async joinPublicCommunity(
    @Request() req: JwtRequest,
    @Param('communityId', ParseIntPipe) communityId: number,
  ): Promise<CommunityDto> {
    return new CommunityDto(
      await this.communityService.joinPublicCommunity(
        req.user.sub,
        communityId,
      ),
    );
  }

  @Patch(':communityId')
  @UseGuards(CommunityLeaderGuard)
  @ApiOkResponse({ type: CommunityDto })
  async update(
    @Param('communityId', ParseIntPipe) communityId: number,
    @Body() body: UpdateCommunityDto,
    @Request() req: JwtRequest,
  ): Promise<CommunityDto> {
    return new CommunityDto(
      await this.communityService.updateCommunity(
        communityId,
        body,
        req.user.sub,
      ),
    );
  }

  @Post(':communityId/removeMember')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: CommunityDto })
  async removeMember(
    @Request() req: JwtRequest,
    @Param('communityId', ParseIntPipe) communityId: number,
    @Body() body: CommunityMemberDto,
  ): Promise<CommunityDto> {
    return new CommunityDto(
      await this.communityService.removeUserFromCommunity({
        userId: req.user.sub,
        removeeId: body.userId,
        communityId,
      }),
    );
  }

  @Post(':communityId/removeMember/admin')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: CommunityDto })
  async removeMemberAdmin(
    @Param('communityId', ParseIntPipe) communityId: number,
    @Body() body: CommunityMemberDto,
  ): Promise<CommunityDto> {
    return new CommunityDto(
      await this.communityService.removeUserFromCommunityAdmin(
        communityId,
        body.userId,
      ),
    );
  }

  @Post(':communityId/leave')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiOkResponse()
  async leave(
    @Param('communityId', ParseIntPipe) communityId: number,
    @Request() req: JwtRequest,
  ): Promise<void> {
    await this.communityService.leaveCommunity(communityId, req.user.sub);
  }

  @Delete(':communityId')
  @UseGuards(AuthGuard)
  @ApiOkResponse()
  async delete(
    @Param('communityId', ParseIntPipe) communityId: number,
    @Request() req: JwtRequest,
  ): Promise<void> {
    await this.communityService.deleteCommunity(req.user.sub, communityId);
  }

  @Delete(':communityId/admin')
  @UseGuards(AdminGuard)
  @ApiOkResponse()
  async deleteAdmin(
    @Param('communityId', ParseIntPipe) communityId: number,
  ): Promise<void> {
    await this.communityService.deleteCommunityAdmin(communityId);
  }

  @Post(':communityId/addMember/admin')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: CommunityDto })
  async addMemberAdmin(
    @Param('communityId', ParseIntPipe) communityId: number,
    @Body() body: CommunityMemberDto,
  ): Promise<CommunityDto> {
    return new CommunityDto(
      await this.communityService.addUserToCommunityAdmin({
        communityId,
        userId: body.userId,
      }),
    );
  }

  @Post(':communityId/addLeader/admin')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: CommunityDto })
  async addLeaderAdmin(
    @Param('communityId', ParseIntPipe) communityId: number,
    @Body() body: CommunityMemberDto,
  ): Promise<CommunityDto> {
    return new CommunityDto(
      await this.communityService.addLeaderAdmin(communityId, body.userId),
    );
  }

  @Post(':communityId/removeLeader/admin')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: CommunityDto })
  async removeLeaderAdmin(
    @Param('communityId', ParseIntPipe) communityId: number,
    @Body() body: CommunityMemberDto,
  ): Promise<CommunityDto> {
    return new CommunityDto(
      await this.communityService.removeLeaderAdmin(communityId, body.userId),
    );
  }

  @Get('memberContactInfo/:communityId')
  @UseGuards(CommunityLeaderGuard)
  @ApiOkResponse({ type: CommunityMemberContactInfoDto, isArray: true })
  async getMemberContactInfo(
    @Request() req: JwtRequest,
    @Param('communityId', ParseIntPipe) communityId: number,
  ): Promise<CommunityMemberContactInfoDto[]> {
    return this.communityService.getMemberContactInfo({
      leaderId: req.user.sub,
      communityId,
    });
  }

  @Get('memberContactInfo/:communityId/admin')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: CommunityMemberContactInfoDto, isArray: true })
  async getMemberContactInfoAdmin(
    @Param('communityId', ParseIntPipe) communityId: number,
  ): Promise<CommunityMemberContactInfoDto[]> {
    return this.communityService.getMemberContactInfo({ communityId });
  }

  @Get('memberContactInfo')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: CommunityMemberContactInfoDto, isArray: true })
  async getAllMemberContactInfoAdmin(): Promise<
    CommunityMemberContactInfoDto[]
  > {
    return this.communityService.getAllMemberContactInfoAdmin();
  }

  @Post('communityInvites/create')
  @UseGuards(CommunityLeaderGuard)
  @ApiOkResponse({ type: CommunityInviteDto })
  async createCommunityInvite(
    @Body() body: CreateCommunityInviteDto,
    @Request() req: JwtRequest,
  ): Promise<CommunityInviteDto> {
    return new CommunityInviteDto(
      await this.communityService.createCommunityInvite(body, req.user.sub),
    );
  }

  @Delete('communityInvites/:inviteId')
  @UseGuards(CommunityLeaderGuard)
  @ApiOkResponse()
  async deleteCommunityInvite(
    @Param('inviteId', ParseIntPipe) inviteId: number,
    @Request() req: JwtRequest,
  ): Promise<void> {
    await this.communityService.deleteCommunityInvite(inviteId, req.user.sub);
  }

  @Post('communityInvites/request')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: CommunityInviteDto })
  async requestCommunityInvite(
    @Body() body: RequestCommunityInviteDto,
    @Request() req: JwtRequest,
  ): Promise<CommunityInviteDto> {
    return new CommunityInviteDto(
      await this.communityService.requestCommunityInvite(body, req.user.sub),
    );
  }

  @Post('communityInvites/:inviteId/approveRequest')
  @UseGuards(CommunityLeaderGuard)
  @ApiOkResponse({ type: CommunityInviteDto })
  async approveCommunityInviteRequest(
    @Param('inviteId', ParseIntPipe) inviteId: number,
    @Request() req: JwtRequest,
  ): Promise<CommunityInviteDto> {
    return new CommunityInviteDto(
      await this.communityService.approveCommunityInviteRequest(
        inviteId,
        req.user.sub,
      ),
    );
  }

  @Post('communityInvites/:inviteId/rejectRequest')
  @UseGuards(CommunityLeaderGuard)
  @ApiOkResponse()
  async rejectCommunityInviteRequest(
    @Param('inviteId', ParseIntPipe) inviteId: number,
    @Request() req: JwtRequest,
  ): Promise<void> {
    await this.communityService.rejectCommunityInviteRequest(
      inviteId,
      req.user.sub,
    );
  }
}
