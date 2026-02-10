import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { CommunityService } from './community.service';
import { CommunityDto, CreateCommunityDto } from './dto/community.dto';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('create/admin')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: CommunityDto })
  async createCommunityAdmin(@Body() body: CreateCommunityDto) {
    return new CommunityDto(
      await this.communityService.createCommunityAdmin(body),
    );
  }
}
