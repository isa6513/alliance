import { PrefillUser } from './entities/prefill-user.entity';
import { PickType } from '@nestjs/swagger';

export class PrefillUserDto extends PickType(PrefillUser, [
  'email',
  'firstName',
  'lastName',
  'phone',
  'city',
]) {}
