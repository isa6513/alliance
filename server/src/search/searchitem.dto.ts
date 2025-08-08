import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SearchItemType {
  User = 'user',
  Action = 'action',
  Post = 'post',
}

export class SearchItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  date?: Date;

  @ApiPropertyOptional()
  image?: string;

  @ApiPropertyOptional()
  webAppLocation?: string;

  @ApiPropertyOptional({ type: [String], isArray: true })
  secondaryData?: string[];

  @ApiProperty({
    enum: SearchItemType,
    enumName: 'SearchItemType',
  })
  type: SearchItemType;
}
