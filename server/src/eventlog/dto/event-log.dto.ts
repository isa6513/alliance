import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import { EventLog, EventType } from '../event-log.entity';

export class EventLogUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  displayName: string;

  constructor(input: User) {
    this.id = input.id;
    this.displayName = input.anonymous ? 'Someone' : input.name;
  }
}

export class EventLogDto extends PickType(EventLog, [
  'id',
  'event',
  'message',
  'blob',
  'createdAt',
  'userId',
]) {
  @ApiPropertyOptional({ type: () => EventLogUserDto })
  user?: EventLogUserDto;

  constructor(input: EventLog) {
    super();
    this.id = input.id;
    this.event = input.event;
    this.message = input.message;
    this.blob = input.blob;
    this.createdAt = input.createdAt;
    this.userId = input.userId;
    this.user = input.user ? new EventLogUserDto(input.user) : undefined;
  }
}

export type EventLogList = {
  items: EventLog[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

export class EventLogListDto {
  @ApiProperty({ type: EventLogDto, isArray: true })
  items: EventLogDto[];

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  constructor(input: EventLogList) {
    this.items = input.items.map((item) => new EventLogDto(item));
    this.totalCount = input.totalCount;
    this.page = input.page;
    this.limit = input.limit;
    this.totalPages = input.totalPages;
  }
}

export class EventLogQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({ enum: EventType, enumName: 'EventType' })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;
}
