// src/forms/dto/create-form.dto.ts
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Form } from './entities/form.entity';
import { FormResponse } from './entities/formresponse.entity';
import { ActionDto } from 'src/actions/dto/action.dto';
import { IsDefined, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from 'src/user/user.dto';
import { DEVICE_VISIBILITY_TARGETS } from './schema';
import type { DeviceVisibilityTarget } from './schema';

export class CreateFormDto extends PickType(Form, ['title', 'schema']) {}

export class SubmitFormDto extends PickType(FormResponse, [
  'answers',
  'schemaSnapshot',
]) {
  @ApiProperty()
  @IsDefined()
  actionId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Object)
  visibilityValidatorResults?: Record<number, boolean>;

  @ApiPropertyOptional({ enum: DEVICE_VISIBILITY_TARGETS })
  @IsEnum(DEVICE_VISIBILITY_TARGETS)
  @IsOptional()
  deviceType?: DeviceVisibilityTarget;
}

export class FormDto extends PickType(Form, ['id', 'title', 'schema']) {
  @ApiPropertyOptional()
  usedInAction?: ActionDto;
}

export class FormResponseDto extends PickType(FormResponse, [
  'id',
  'answers',
  'formId',
  'schemaSnapshot',
  'visibilityValidatorResults',
  'deviceType',
]) {
  @ApiProperty()
  user: UserDto;
}
