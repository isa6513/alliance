// src/forms/dto/create-form.dto.ts
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Form } from './entities/form.entity';
import { FormResponse } from './entities/formresponse.entity';
import { ActionDto } from 'src/actions/dto/action.dto';
import { IsDefined } from 'class-validator';

export class CreateFormDto extends PickType(Form, ['title', 'schema']) {}

export class SubmitFormDto extends PickType(FormResponse, [
  'answers',
  'schemaSnapshot',
]) {
  @ApiProperty()
  @IsDefined()
  actionId: number;
}

export class FormDto extends PickType(Form, ['id', 'title', 'schema']) {
  @ApiPropertyOptional()
  usedInAction?: ActionDto;
}

export class FormResponseDto extends PickType(FormResponse, [
  'id',
  'answers',
  'formId',
  'user',
  'schemaSnapshot',
]) {}
