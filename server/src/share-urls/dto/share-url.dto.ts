import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ShareUrl, ShareUrlKind } from '../entities/share-url.entity';

export class GetShareLinkDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  actionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  externalTargetId?: number;

  @ApiPropertyOptional({
    description:
      'Set true for an invite link to the signup page. Provide exactly one of actionId, externalTargetId, or invite.',
  })
  @IsOptional()
  @IsBoolean()
  invite?: boolean;
}

export class CreateDuplicateShareLinkDto {
  @ApiPropertyOptional({
    description: 'Owning user. Provide exactly one of userId or campaignId.',
  })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({
    description:
      'Owning campaign. Provide exactly one of userId or campaignId.',
  })
  @IsOptional()
  @IsInt()
  campaignId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  actionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  externalTargetId?: number;

  @ApiPropertyOptional({
    description:
      'Set true for an invite link to the signup page. Provide exactly one of actionId, externalTargetId, or invite.',
  })
  @IsOptional()
  @IsBoolean()
  invite?: boolean;

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

  @ApiProperty({ enum: ShareUrlKind, enumName: 'ShareUrlKind' })
  kind: ShareUrlKind;

  @ApiPropertyOptional()
  sid?: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  duplicate: boolean;

  @ApiProperty({ type: String, nullable: true })
  label: string | null;

  @ApiProperty({ type: Number, nullable: true })
  userId: number | null;

  @ApiProperty({ type: Number, nullable: true })
  campaignId: number | null;

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
    this.kind = input.kind;
    this.sid = input.sid;
    this.url = input.url;
    this.duplicate = input.duplicate;
    this.label = input.label ?? null;
    this.userId = input.userId ?? null;
    this.campaignId = input.campaignId ?? null;
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
