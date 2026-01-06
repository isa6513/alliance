import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ProfileDto } from 'src/user/dto/user.dto';
import { ActionEventNotif } from './action-event-notif.entity';

export class ActionEventNotifDto extends OmitType(ActionEventNotif, ['user']) {
  @ApiProperty({ type: ProfileDto })
  user: ProfileDto;

  constructor(actionEventNotif: ActionEventNotif) {
    super();
    Object.assign(this, actionEventNotif);
    this.user = new ProfileDto(actionEventNotif.user);
  }
}
