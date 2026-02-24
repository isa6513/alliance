import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class SignContractDto {
  @ApiProperty()
  @Allow()
  signedName: string;
}
