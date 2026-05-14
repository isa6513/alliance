import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ShareUrl } from '../entities/share-url.entity';

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

export class CreateDuplicateShareLinkDto {
  @ApiProperty()
  @IsInt()
  userId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  actionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  externalTargetId?: number;

  @ApiPropertyOptional({
    description: 'Optional label to distinguish this duplicate at a glance.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;
}

export class UpdateShareLinkLabelDto {
  @ApiPropertyOptional({
    description:
      'New label for the share URL. Send an empty string or omit to clear.',
  })
  @IsOptional()
  @IsString()
  label?: string;
}

type ShareUrlAdminTarget = { id: number; name: string };

class ShareUrlAdminActionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  constructor(input: ShareUrlAdminTarget) {
    this.id = input.id;
    this.name = input.name;
  }
}

class ShareUrlAdminExternalTargetDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  constructor(input: ShareUrlAdminTarget) {
    this.id = input.id;
    this.name = input.name;
  }
}

export class ShareUrlAdminDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  sid?: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  duplicate: boolean;

  @ApiProperty({ type: String, nullable: true })
  label: string | null;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiPropertyOptional({ type: () => ShareUrlAdminActionDto, nullable: true })
  @Type(() => ShareUrlAdminActionDto)
  action?: ShareUrlAdminActionDto | null;

  @ApiPropertyOptional({
    type: () => ShareUrlAdminExternalTargetDto,
    nullable: true,
  })
  @Type(() => ShareUrlAdminExternalTargetDto)
  externalTarget?: ShareUrlAdminExternalTargetDto | null;

  constructor(input: ShareUrl) {
    this.id = input.id;
    this.sid = input.sid;
    this.url = input.url;
    this.duplicate = input.duplicate;
    this.label = input.label ?? null;
    this.createdAt = input.createdAt;
    this.action = input.action
      ? new ShareUrlAdminActionDto({
          id: input.action.id,
          name: input.action.name,
        })
      : null;
    this.externalTarget = input.externalTarget
      ? new ShareUrlAdminExternalTargetDto({
          id: input.externalTarget.id,
          name: input.externalTarget.name,
        })
      : null;
  }
}

export class ShareLinkDto {
  @ApiProperty()
  url: string;

  constructor(url: string) {
    this.url = url;
  }
}
