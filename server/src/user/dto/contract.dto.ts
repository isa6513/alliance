import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Contract } from 'src/contract/entities/contract.entity';

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
