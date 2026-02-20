import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { GeneralUpdate } from '../entities/general-update.entity';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsUUID } from 'class-validator';
import { Tag } from 'src/user/entities/tag.entity';
import { ActionSuite } from '../entities/action-suite.entity';

export class GeneralUpdateDto extends PickType(GeneralUpdate, [
  'id',
  'name',
  'schema',
  'startDate',
  'endDate',
  'priority',
]) {
  constructor(generalUpdate: GeneralUpdate) {
    super();
    Object.assign(this, {
      id: generalUpdate.id,
      name: generalUpdate.name,
      schema: generalUpdate.schema,
      startDate: generalUpdate.startDate,
      endDate: generalUpdate.endDate,
      priority: generalUpdate.priority,
    });
  }
}

export class GeneralUpdateAdminDto extends PickType(GeneralUpdate, [
  'id',
  'name',
  'schema',
  'startDate',
  'endDate',
  'createdAt',
  'updatedAt',
  'useManualCohort',
  'manualCohortUserIds',
  'priority',
]) {
  @ApiProperty({ type: () => Tag, isArray: true })
  @Type(() => Tag)
  tags: Tag[];

  @ApiPropertyOptional({ type: () => ActionSuite, isArray: true })
  @Type(() => ActionSuite)
  suites?: ActionSuite[];

  constructor(generalUpdate: GeneralUpdate) {
    super();
    Object.assign(this, {
      id: generalUpdate.id,
      name: generalUpdate.name,
      schema: generalUpdate.schema,
      startDate: generalUpdate.startDate,
      endDate: generalUpdate.endDate,
      createdAt: generalUpdate.createdAt,
      updatedAt: generalUpdate.updatedAt,
      useManualCohort: generalUpdate.useManualCohort,
      manualCohortUserIds: generalUpdate.manualCohortUserIds,
      priority: generalUpdate.priority,
      tags: generalUpdate.tags ?? [],
      suites: generalUpdate.suites ?? [],
    });
  }
}

export class CreateGeneralUpdateDto extends OmitType(GeneralUpdate, [
  'id',
  'createdAt',
  'updatedAt',
  'activities',
  'tags',
  'suites',
  'schema',
]) {
  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ type: Number, isArray: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  suiteIds?: number[];
}

export class UpdateGeneralUpdateDto extends PartialType(
  OmitType(GeneralUpdate, [
    'id',
    'createdAt',
    'updatedAt',
    'activities',
    'tags',
    'suites',
    'priority',
  ]),
) {
  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ type: Number, isArray: true })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  suiteIds?: number[];
}
