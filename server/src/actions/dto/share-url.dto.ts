import { ApiProperty, PickType } from '@nestjs/swagger';
import { ActionShareUrl } from '../entities/action-share-url.entity';
import { ProfileDto } from 'src/user/user.dto';
import { Type } from 'class-transformer';
export class ShareUrlDto extends PickType(ActionShareUrl, [
  'url',
  'sid',
  'id',
  'data',
]) {
  @ApiProperty({ type: ProfileDto })
  @Type(() => ProfileDto)
  user: ProfileDto;

  constructor(shareUrl: ActionShareUrl) {
    super();
    Object.assign(this, shareUrl);
    this.user = new ProfileDto(shareUrl.user);
  }
}

export class ShareUrlStatsDto {
  @ApiProperty({ type: ProfileDto })
  @Type(() => ProfileDto)
  user: ProfileDto;

  @ApiProperty()
  inviteCount: number;

  @ApiProperty()
  sid: string;

  constructor(user: ProfileDto, inviteCount: number, sid: string) {
    this.user = user;
    this.inviteCount = inviteCount;
    this.sid = sid;
  }
}
