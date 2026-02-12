import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { JwtRequest } from 'src/auth/guards/jwtreq';
import { MessageService } from './message.service';
import {
  ConversationMessagesQueryDto,
  CreateMessageDto,
  MessageDto,
} from './dto/messaging.dto';
import { ConversationService } from './conversation.service';

@ApiTags('messaging')
@Controller('messaging/messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
  ) { }

  @Get('admin/:conversationId')
  @ApiOkResponse({ type: MessageDto, isArray: true })
  @UseGuards(AdminGuard)
  getConversationMessagesForAdmin(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query() query: ConversationMessagesQueryDto,
  ): Promise<MessageDto[]> {
    return this.messageService.getConversationMessagesForAdmin(
      conversationId,
      query,
    );
  }

  @Post()
  @ApiOkResponse({ type: MessageDto })
  @UseGuards(AuthGuard)
  async sendMessage(
    @Body() dto: CreateMessageDto,
    @Request() req: JwtRequest,
  ): Promise<MessageDto> {
    await this.ensureParticipant(dto.conversationId, req.user.sub);
    return this.messageService.sendMessage(req.user.sub, dto);
  }

  @Get(':conversationId')
  @ApiOkResponse({ type: MessageDto, isArray: true })
  @UseGuards(AuthGuard)
  async getMessages(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query() query: ConversationMessagesQueryDto,
    @Request() req: JwtRequest,
  ): Promise<MessageDto[]> {
    await this.ensureParticipant(conversationId, req.user.sub);
    return this.messageService.getConversationMessages(
      req.user.sub,
      conversationId,
      query,
    );
  }

  private async ensureParticipant(conversationId: number, userId: number) {
    const isParticipant = await this.conversationService.isParticipant(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException('You are not part of this conversation.');
    }
  }
}
