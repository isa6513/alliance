import { ApiProperty, PickType } from '@nestjs/swagger';
import { ActionShareUrl } from '../entities/action-share-url.entity';
import { ProfileDto } from 'src/user/dto/user.dto';
import { Type } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
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
    this.url = shareUrl.url;
    this.sid = shareUrl.sid;
    this.id = shareUrl.id;
    this.data = shareUrl.data;
    this.user = new ProfileDto(shareUrl.user);
  }
}

export class ShareLinkDto {
  @ApiProperty()
  url: string;

  constructor(url: string) {
    this.url = url;
  }
}

export type ShareUrlStats = {
  user: User;
  inviteCount: number;
  sid: string;
  yesCount: number;
};

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

  constructor(input: ShareUrlStats) {
    this.user = new ProfileDto(input.user);
    this.inviteCount = input.inviteCount;
    this.sid = input.sid;
    this.yesCount = input.yesCount;
  }
}
