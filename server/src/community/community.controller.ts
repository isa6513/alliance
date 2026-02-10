import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { CommunityService } from './community.service';
import { CommunityDto, CreateCommunityDto } from './dto/community.dto';
import { AuthGuard, JwtRequest } from 'src/auth/guards/auth.guard';

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
}
