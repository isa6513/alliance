import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Contract } from '../entities/contract.entity';
import type { ContractField } from '@alliance/common/forms/form-schema';

export class ContractDto extends PickType(Contract, ['id', 'markdown']) {
  constructor(contract: Contract) {
    super();
    Object.assign(this, {
      id: contract.id,
      markdown: contract.markdown,
    });
  }
}

export class SignContractDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signedName: string;
}

export class ContractAdminDto extends PickType(Contract, [
  'id',
  'name',
  'createdAt',
  'markdown',
  'startDate',
  'endDate',
]) {
  constructor(contract: Contract) {
    super();
    Object.assign(this, {
      id: contract.id,
      name: contract.name,
      createdAt: contract.createdAt,
      markdown: contract.markdown,
      startDate: contract.startDate,
      endDate: contract.endDate,
    });
  }
}

export class CreateContractDto extends PickType(Contract, [
  'name',
  'markdown',
  'startDate',
  'endDate',
]) {}

export class UpdateContractDto extends PickType(Contract, [
  'name',
  'startDate',
  'endDate',
]) {}

export type ContractFieldDto = ContractField & {
  contract: ContractDto;
};
