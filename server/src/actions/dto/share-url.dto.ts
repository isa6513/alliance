import { ApiProperty, PickType } from '@nestjs/swagger';
import { ActionShareUrl } from '../entities/action-share-url.entity';
import { ProfileDto } from 'src/user/dto/user.dto';
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

  @ApiProperty()
  yesCount: number;

  constructor(
    user: ProfileDto,
    inviteCount: number,
    sid: string,
    yesCount: number = 0,
  ) {
    this.user = user;
    this.inviteCount = inviteCount;
    this.sid = sid;
    this.yesCount = yesCount;
  }
}
