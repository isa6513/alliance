import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { EventLogService } from './eventlog.service';
import {
  EventLogDto,
  EventLogListDto,
  EventLogQueryDto,
} from './dto/event-log.dto';

@Controller('eventlog')
export class EventLogController {
  constructor(private readonly eventLogService: EventLogService) { }

  @Get()
  @ApiOkResponse({ type: EventLogListDto })
  @UseGuards(AdminGuard)
  findAll(@Query() query: EventLogQueryDto): Promise<EventLogListDto> {
    return this.eventLogService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: EventLogDto })
  @UseGuards(AdminGuard)
  async findOne(@Param('id') id: string): Promise<EventLogDto> {
    const event = await this.eventLogService.findOne(id);
    if (!event) {
      throw new NotFoundException(`Event log with id ${id} not found`);
    }
    return event;
  }
}
