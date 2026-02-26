import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SearchItemType {
  User = 'user',
  Action = 'action',
  Post = 'post',
  Recent = 'recent',
  Page = 'page',
  Other = 'other',
}

export class SearchItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  date?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsString()
  webAppLocation: string;

  @ApiPropertyOptional({ type: [String], isArray: true })
  @IsOptional()
  secondaryData?: string[];

  @ApiProperty({
    enum: SearchItemType,
    enumName: 'SearchItemType',
  })
  @IsEnum(SearchItemType)
  type: SearchItemType;
}
