import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { User } from 'src/user/entities/user.entity';
import {
  CustomValidator,
  CustomValidatorType,
} from './entities/customvalidator.entity';

export type CustomValidatorTypeDtoArgs = {
  name: string;
  id: CustomValidatorType;
  withIdField: boolean;
  usableForVisibility: boolean;
};

export class CustomValidatorTypeDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: CustomValidatorType, enumName: 'CustomValidatorType' })
  @IsNotEmpty()
  id: CustomValidatorType;

  @ApiProperty()
  @IsNotEmpty()
  withIdField: boolean;

  @ApiProperty()
  @IsNotEmpty()
  usableForVisibility: boolean;

  constructor(input: CustomValidatorTypeDtoArgs) {
    this.name = input.name;
    this.id = input.id;
    this.withIdField = input.withIdField;
    this.usableForVisibility = input.usableForVisibility;
  }
}

export class CreateCustomValidatorDto {
  @ApiProperty({ enum: CustomValidatorType, enumName: 'CustomValidatorType' })
  @IsNotEmpty()
  type: CustomValidatorType;

  @ApiPropertyOptional()
  @IsOptional()
  idArgument?: string;

  @ApiPropertyOptional()
  @IsOptional()
  expression?: string;
}

export class CustomValidatorDto extends PickType(CustomValidator, [
  'id',
  'type',
  'idArgument',
  'expression',
]) {
  constructor(input: CustomValidator) {
    super();
    this.id = input.id;
    this.type = input.type;
    this.idArgument = input.idArgument;
    this.expression = input.expression;
  }
}

export class CreateCustomValidatorResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number;
}

export type CustomValidatorResponse = {
  isValid: boolean;
  message?: string;
};

export class CustomValidatorResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  isValid: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  message?: string;

  constructor(input: CustomValidatorResponse) {
    this.isValid = input.isValid;
    this.message = input.message;
  }
}

export class RunValidatorDto {
  @ApiPropertyOptional()
  @IsOptional()
  fieldValue?: string;
}

export class CustomExpressionUserDto extends PickType(User, [
  'id',
  'name',
  'anonymous',
  'hasActiveContract',
] as const) {}

export class TestCustomExpressionDto {
  @ApiProperty()
  @IsNotEmpty()
  expression: string;

  @ApiPropertyOptional()
  @IsOptional()
  userId?: number;
}

export class TestCustomExpressionResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  passCount: number;

  @ApiProperty()
  @IsNotEmpty()
  failCount: number;

  @ApiProperty()
  @IsNotEmpty()
  totalCount: number;

  @ApiProperty({ type: CustomExpressionUserDto, isArray: true })
  @Type(() => CustomExpressionUserDto)
  @IsNotEmpty()
  passUsers: CustomExpressionUserDto[];

  @ApiProperty({ type: CustomExpressionUserDto, isArray: true })
  @Type(() => CustomExpressionUserDto)
  @IsNotEmpty()
  failUsers: CustomExpressionUserDto[];

  @ApiPropertyOptional()
  @IsOptional()
  selectedUserId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  selectedUserResult?: boolean;
}
