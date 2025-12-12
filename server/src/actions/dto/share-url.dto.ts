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
