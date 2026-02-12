import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { EventLog, EventType } from '../event-log.entity';

export class EventLogUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  displayName: string;
}

export class EventLogDto extends OmitType(EventLog, ['user']) {
  @ApiPropertyOptional({ type: () => EventLogUserDto })
  user?: EventLogUserDto;
}

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
