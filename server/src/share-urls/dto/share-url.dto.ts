import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class GetShareLinkDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  actionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  externalTargetId?: number;
}

export class ShareLinkDto {
  @ApiProperty()
  url: string;

  constructor(url: string) {
    this.url = url;
  }
}
