import {
  IsDefined,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  Allow,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TokenMode } from './signin.dto';

export class SignUpDto {
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  readonly name: string;

  @IsDefined()
  @IsEmail()
  //   @Validate(IsUserAlreadyExist)
  @ApiProperty()
  readonly email: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  readonly password: string;

  @Allow()
  @IsEnum(['cookie', 'header'])
  @ApiProperty({ enum: ['cookie', 'header'], enumName: 'TokenMode' })
  mode: TokenMode;

  @IsOptional()
  @ApiPropertyOptional()
  readonly referralCode?: string;
}
