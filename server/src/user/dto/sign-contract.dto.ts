import { PickType } from '@nestjs/swagger';
import { ContractEvent } from '../entities/contract-event.entity';

export class SignContractDto extends PickType(ContractEvent, ['signedName']) {}
