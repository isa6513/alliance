import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { JwtRequest } from 'src/auth/guards/jwtreq';
import {
  CreateDuplicateShareLinkDto,
  GetShareLinkDto,
  ShareLinkDto,
  ShareUrlAdminDto,
  UpdateShareLinkLabelDto,
} from './dto/share-url.dto';
import { ShareUrlsService } from './share-urls.service';

@Controller('share-urls')
export class ShareUrlsController {
  constructor(private readonly shareUrlsService: ShareUrlsService) {}

  @Post('get-share-link')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: ShareLinkDto })
  async getShareLink(
    @Body() body: GetShareLinkDto,
    @Request() req: JwtRequest,
  ): Promise<ShareLinkDto> {
    const url = await this.shareUrlsService.getShareLink({
      userId: req.user.sub,
      actionId: body.actionId,
      externalTargetId: body.externalTargetId,
    });
    return new ShareLinkDto(url);
  }

  @Post('create-duplicate')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: ShareUrlAdminDto })
  async createDuplicate(
    @Body() body: CreateDuplicateShareLinkDto,
  ): Promise<ShareUrlAdminDto> {
    const row = await this.shareUrlsService.createDuplicate({
      userId: body.userId,
      actionId: body.actionId,
      externalTargetId: body.externalTargetId,
      label: body.label,
    });
    return new ShareUrlAdminDto(row);
  }

  @Get('for-user/:userId')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: ShareUrlAdminDto, isArray: true })
  async findForUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ShareUrlAdminDto[]> {
    const rows = await this.shareUrlsService.findForUser(userId);
    return rows.map((r) => new ShareUrlAdminDto(r));
  }

  @Patch(':id/label')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: ShareUrlAdminDto })
  async updateLabel(
    @Param('id') id: string,
    @Body() body: UpdateShareLinkLabelDto,
  ): Promise<ShareUrlAdminDto> {
    const row = await this.shareUrlsService.updateLabel(id, body.label);
    return new ShareUrlAdminDto(row);
  }
}
