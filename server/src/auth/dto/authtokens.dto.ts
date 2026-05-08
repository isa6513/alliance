import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/user.dto';

export class RefreshTokensResponseDto {
  @ApiPropertyOptional()
  access_token?: string;

  @ApiPropertyOptional()
  refresh_token?: string;

  constructor(input: RefreshTokensResponse) {
    this.access_token = input.access_token;
    this.refresh_token = input.refresh_token;
  }
}

export type RefreshTokensResponse = {
  access_token?: string;
  refresh_token?: string;
};

export class AccessToken {
  @ApiProperty()
  access_token: string;
}

export class AuthMeResponseDto {
  @ApiProperty({ type: () => UserDto })
  user: UserDto;

  @ApiPropertyOptional()
  isImpersonation?: boolean;
}
