import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { GeneralUpdate } from '../entities/general-update.entity';
import { Type } from 'class-transformer';
import { Tag } from 'src/user/entities/tag.entity';
import { ActionSuite } from '../entities/action-suite.entity';

export class GeneralUpdateDto extends PickType(GeneralUpdate, [
  'id',
  'name',
  'schema',
  'startDate',
  'endDate',
]) {
  constructor(generalUpdate: GeneralUpdate) {
    super();
    Object.assign(this, {
      id: generalUpdate.id,
      name: generalUpdate.name,
      schema: generalUpdate.schema,
      startDate: generalUpdate.startDate,
      endDate: generalUpdate.endDate,
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
  tagIds?: string[];

  @ApiPropertyOptional({ type: Number, isArray: true })
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
  ]),
) {
  @ApiPropertyOptional({ type: String, isArray: true })
  tagIds?: string[];

  @ApiPropertyOptional({ type: Number, isArray: true })
  suiteIds?: number[];
}
