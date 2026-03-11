import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { JwtRequest } from 'src/auth/guards/jwtreq';
import { NotificationDto } from './dto/notification.dto';
import { ActionEventNotifDto } from './entities/action-event-notif.dto';
import { NotifsService } from './notifs.service';
import { NotifClickDto, NotifClickResponseDto } from './dto/notifclick.dto';
import {
  MarkUnreadContentReadDto,
  ReadNotificationQueryDto,
} from './dto/unread-content.dto';

@Controller('notifs')
export class NotifsController {
  constructor(private readonly notifsService: NotifsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: [NotificationDto] })
  findAll(@Request() req: JwtRequest): Promise<NotificationDto[]> {
    return this.notifsService.findAll(req.user.sub);
  }

  @Post('read/:id')
  @UseGuards(AuthGuard)
  @ApiOkResponse()
  setRead(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ReadNotificationQueryDto,
    @Request() req: JwtRequest,
  ) {
    return this.notifsService.setRead(id, req.user.sub, query.sourceType);
  }

  @Post('read-all')
  @UseGuards(AuthGuard)
  @ApiOkResponse()
  setReadAll(@Request() req: JwtRequest) {
    return this.notifsService.setReadAll(req.user.sub);
  }

  @Post('read-content')
  @UseGuards(AuthGuard)
  @ApiOkResponse()
  setReadContent(
    @Body() body: MarkUnreadContentReadDto,
    @Request() req: JwtRequest,
  ) {
    return this.notifsService.setUnreadContentReadByContent(req.user.sub, body);
  }

  @UseGuards(AdminGuard)
  @Get('for-user/:id')
  @ApiOkResponse({ type: [ActionEventNotifDto] })
  notifsForUser(@Param('id', ParseIntPipe) id: number) {
    return this.notifsService
      .notifsForUser(id)
      .then((notifs) => notifs.map((notif) => new ActionEventNotifDto(notif)));
  }

  @Post('linkClick')
  @ApiOkResponse({ type: NotifClickResponseDto })
  linkClick(@Body() body: NotifClickDto) {
    return this.notifsService.notifLinkClick(body);
  }
}
