import { PickType } from '@nestjs/swagger';
import { GeneralUpdate } from '../entities/general-update.entity';

export class GeneralUpdateDto extends PickType(GeneralUpdate, [
  'id',
  'name',
  'schema',
  'createdAt',
  'updatedAt',
  'startDate',
  'endDate',
]) {}
