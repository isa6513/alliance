import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { Public } from 'src/auth/public.decorator';
import { ActionPartnershipsService } from './action-partnerships.service';
import {
  ActionPartnershipNoteDto,
  ActionPartnershipResponseDto,
  CreateActionPartnershipNoteDto,
  CreateActionPartnershipResponseDto,
} from './dto/action-partnership.dto';

@Controller('action-partnerships')
export class ActionPartnershipsController {
  constructor(
    private readonly actionPartnershipsService: ActionPartnershipsService,
  ) {}

  @Post('responses')
  @Public()
  @ApiOkResponse({ type: ActionPartnershipResponseDto })
  async createResponse(
    @Body() dto: CreateActionPartnershipResponseDto,
  ): Promise<ActionPartnershipResponseDto> {
    return new ActionPartnershipResponseDto(
      await this.actionPartnershipsService.createResponse(dto),
    );
  }

  @Get('responses')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: ActionPartnershipResponseDto, isArray: true })
  async findAllResponsesAdmin(): Promise<ActionPartnershipResponseDto[]> {
    const responses =
      await this.actionPartnershipsService.findAllResponsesAdmin();
    return responses.map((response) => new ActionPartnershipResponseDto(response));
  }

  @Post('responses/:id/notes')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: ActionPartnershipNoteDto })
  async createNoteAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateActionPartnershipNoteDto,
  ): Promise<ActionPartnershipNoteDto> {
    return new ActionPartnershipNoteDto(
      await this.actionPartnershipsService.createNoteAdmin(id, dto),
    );
  }
}
