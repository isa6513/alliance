import { PickType } from '@nestjs/swagger';
import { GeneralUpdate } from '../entities/general-update.entity';

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
