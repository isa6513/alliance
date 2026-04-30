import { ApiProperty } from '@nestjs/swagger';
import { ReminderGroup } from 'src/actions/entities/reminder-group.entity';
import { User } from 'src/user/entities/user.entity';

export class NotificationPlan {
  @ApiProperty()
  scheduledFor: Date;
  @ApiProperty()
  user: User;
  group: ReminderGroup;
}

export class PreviewNotificationPlanDto extends NotificationPlan {
  @ApiProperty({
    enum: ['email', 'text', 'push'],
    enumName: 'NotificationChannel',
    isArray: true,
  })
  channels: ('email' | 'text' | 'push')[];
}
