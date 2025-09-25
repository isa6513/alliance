import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { IsDefined, IsEnum } from 'class-validator';
export type TokenMode = 'cookie' | 'header';

export class SignInDto extends PickType(User, ['email', 'password']) {
  @ApiProperty({ enum: ['cookie', 'header'] })
  @IsDefined()
  @IsEnum(['cookie', 'header'])
  mode: TokenMode;
}

export class SignInResponseDto {
  @ApiProperty()
  isAdmin: boolean;

  @ApiPropertyOptional()
  access_token?: string;

  @ApiPropertyOptional()
  refresh_token?: string;
}
