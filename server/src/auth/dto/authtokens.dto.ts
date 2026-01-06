import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/user.dto';

export class AuthTokens {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}

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
