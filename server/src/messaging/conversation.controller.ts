import {
  Body,
  Controller,
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
