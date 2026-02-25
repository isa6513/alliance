import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
export type TokenMode = 'cookie' | 'header';

export class SignInDto {
  @ApiProperty({ enum: ['cookie', 'header'] })
  @IsDefined()
  @IsEnum(['cookie', 'header'])
  mode: TokenMode;

  @ApiProperty()
  @IsDefined()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class SignInResponseDto {
  @ApiProperty()
  isAdmin: boolean;

  @ApiPropertyOptional()
  access_token?: string;

  @ApiPropertyOptional()
  refresh_token?: string;
}
