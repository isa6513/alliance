import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { JwtRequest } from 'src/auth/guards/jwtreq';
import { GetShareLinkDto, ShareLinkDto } from './dto/share-url.dto';
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
}
