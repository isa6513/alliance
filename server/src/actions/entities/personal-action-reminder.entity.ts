import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActionEvent } from './action-event.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Allow, IsDefined, IsOptional } from 'class-validator';
import { ActionEventNotif } from 'src/notifs/entities/action-event-notif.entity';
import { ReminderGroup } from './reminder-group.entity';
import { Temporal } from '@js-temporal/polyfill';

@Entity()
export class PersonalActionReminder {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @ApiProperty({ type: () => ActionEvent })
  @ManyToOne(
    () => ActionEvent,
    (actionEvent) => actionEvent.personalActionReminders,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'memberActionEventId' })
  @Type(() => ActionEvent)
  @Allow()
  @IsDefined()
  memberActionEvent: ActionEvent;

  @ManyToOne(() => User, (user) => user.personalActionReminders)
  @ApiProperty({ type: () => User })
  @JoinColumn({ name: 'userId' })
  @Type(() => User)
  @IsDefined()
  user: User;

  @ApiPropertyOptional({ type: Date, default: null })
  @Column({ type: 'timestamptz', nullable: true })
  @IsOptional()
  @Type(() => Date)
  sentAt?: Date;

  @ApiProperty()
  @Column({ default: false })
  @Allow()
  skippedForCompletion: boolean;

  @OneToOne(() => ActionEventNotif, { nullable: true })
  @ApiPropertyOptional({ type: ActionEventNotif })
  @IsOptional()
  @Type(() => ActionEventNotif)
  notification?: ActionEventNotif;

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  createdAt: Date;

  @ManyToOne(() => ReminderGroup, (group) => group.reminders, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: ReminderGroup })
  @Type(() => ReminderGroup)
  @IsDefined()
  group: ReminderGroup;

  @ApiPropertyOptional({ type: Date })
  @Expose()
  get sendTime(): Date {
    const defaultSendTime: Temporal.PlainTime =
      Temporal.PlainTime.from('19:00:00');
    const defaultTimeZone: Temporal.TimeZoneLike = 'America/Los_Angeles'; //pacific

    const timeOfDay: Temporal.PlainTime =
      this.user.preferredReminderTime ?? defaultSendTime;
    const timezone: Temporal.TimeZoneLike =
      this.user.timeZone ?? defaultTimeZone;

    const zoned = this.group.sendDay.toZonedDateTime({
      plainTime: timeOfDay,
      timeZone: timezone,
    });

    return new Date(zoned.toInstant().epochMilliseconds);
  }
}
