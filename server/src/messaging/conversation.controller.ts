import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, JwtRequest } from 'src/auth/guards/auth.guard';
import { ConversationService } from './conversation.service';
import {
  ConversationDto,
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  ConversationParticipantDto,
  UnreadMessagesDto,
  UpdateConversationDto,
} from './dto/messaging.dto';

@ApiTags('messaging')
@Controller('messaging/conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  @ApiOkResponse({ type: ConversationDto, isArray: true })
  @UseGuards(AuthGuard)
  getMyConversations(@Request() req: JwtRequest): Promise<ConversationDto[]> {
    return this.conversationService.getUserConversations(req.user.sub);
  }

  @Post('direct')
  @ApiOkResponse({ type: ConversationDto })
  @UseGuards(AuthGuard)
  createDirectConversation(
    @Body() dto: CreateDirectConversationDto,
    @Request() req: JwtRequest,
  ): Promise<ConversationDto> {
    return this.conversationService.createDirectConversation(req.user.sub, dto);
  }

  @Post('group')
  @ApiOkResponse({ type: ConversationDto })
  @UseGuards(AuthGuard)
  createGroupConversation(
    @Body() dto: CreateGroupConversationDto,
    @Request() req: JwtRequest,
  ): Promise<ConversationDto> {
    return this.conversationService.createGroupConversation(req.user.sub, dto);
  }

  @Post(':conversationId/update')
  @ApiOkResponse({ type: ConversationDto })
  @UseGuards(AuthGuard)
  updateInfo(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body() body: UpdateConversationDto,
    @Request() req: JwtRequest,
  ): Promise<ConversationDto> {
    return this.ensureParticipantAndRun(conversationId, req.user.sub, () =>
      this.conversationService.updateConversation(
        conversationId,
        req.user.sub,
        body,
      ),
    );
  }

  @Post(':conversationId/accept')
  @ApiOkResponse({ type: ConversationDto })
  @UseGuards(AuthGuard)
  acceptInvite(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Request() req: JwtRequest,
  ): Promise<ConversationDto> {
    return this.ensureParticipantAndRun(conversationId, req.user.sub, () =>
      this.conversationService.acceptInvite(conversationId, req.user.sub),
    );
  }

  @Post(':conversationId/decline')
  @ApiOkResponse({ type: ConversationDto })
  @UseGuards(AuthGuard)
  declineInvite(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Request() req: JwtRequest,
  ): Promise<ConversationDto> {
    return this.ensureParticipantAndRun(conversationId, req.user.sub, () =>
      this.conversationService.declineInvite(conversationId, req.user.sub),
    );
  }

  @Post(':conversationId/participants')
  @ApiOkResponse({ type: ConversationDto })
  @UseGuards(AuthGuard)
  addParticipant(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body() body: ConversationParticipantDto,
    @Request() req: JwtRequest,
  ): Promise<ConversationDto> {
    return this.conversationService.addParticipantToConversation(
      conversationId,
      req.user.sub,
      body,
    );
  }

  @Delete(':conversationId/participants/:userId')
  @ApiOkResponse({ type: ConversationDto })
  @UseGuards(AuthGuard)
  removeParticipant(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Request() req: JwtRequest,
  ): Promise<ConversationDto> {
    return this.conversationService.removeParticipantFromConversation(
      conversationId,
      req.user.sub,
      targetUserId,
    );
  }

  @Post(':conversationId/read')
  @ApiOkResponse({ type: ConversationDto })
  @UseGuards(AuthGuard)
  markRead(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Request() req: JwtRequest,
  ): Promise<ConversationDto> {
    return this.conversationService.markConversationRead(
      conversationId,
      req.user.sub,
    );
  }

  @Get('unread')
  @ApiOkResponse({ type: UnreadMessagesDto })
  @UseGuards(AuthGuard)
  async getUnreadMessages(
    @Request() req: JwtRequest,
  ): Promise<UnreadMessagesDto> {
    return this.conversationService.getUnreadMessages(req.user.sub);
  }

  @Post(':conversationId/leave')
  @ApiOkResponse({ type: ConversationDto })
  @UseGuards(AuthGuard)
  leave(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Request() req: JwtRequest,
  ): Promise<ConversationDto> {
    return this.conversationService.leaveConversation(
      conversationId,
      req.user.sub,
    );
  }

  private async ensureParticipantAndRun<T>(
    conversationId: number,
    userId: number,
    action: () => Promise<T>,
  ): Promise<T> {
    const isParticipant = await this.conversationService.isParticipant(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException('You are not part of this conversation.');
    }
    return action();
  }
}
