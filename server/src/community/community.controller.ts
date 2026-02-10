import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
  ) {
    return new CommunityDto(
      await this.communityService.createCommunity(req.user.sub, body),
    );
  }

  @Get('list')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: [CommunityDto] })
  async getCommunities() {
    return (await this.communityService.findAllCommunities()).map(
      (community) => new CommunityDto(community),
    );
  }

  @Get('list/public')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: [CommunityDto] })
  async getPublicCommunities() {
    return (await this.communityService.findPublicCommunities()).map(
      (community) => new CommunityDto(community),
    );
  }

  @Post(':communityId/join')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: CommunityDto })
  async joinPublicCommunity(
    @Request() req: JwtRequest,
    @Param('communityId', ParseIntPipe) communityId: number,
  ) {
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
  ) {
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
  ) {
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
  ) {
    return new CommunityDto(
      await this.communityService.removeUserFromCommunityAdmin(
        communityId,
        body.userId,
      ),
    );
  }

  @Delete(':communityId')
  @UseGuards(AuthGuard)
  @ApiOkResponse()
  async delete(
    @Param('communityId', ParseIntPipe) communityId: number,
    @Request() req: JwtRequest,
  ) {
    await this.communityService.deleteCommunity(req.user.sub, communityId);
  }

  @Delete(':communityId/admin')
  @UseGuards(AdminGuard)
  @ApiOkResponse()
  async deleteAdmin(@Param('communityId', ParseIntPipe) communityId: number) {
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
}
