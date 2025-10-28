import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsDefined, IsOptional } from 'class-validator';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose, Type } from 'class-transformer';
import { ActionEvent } from './action-event.entity';
import { Temporal } from '@js-temporal/polyfill';
import { temporalPlainDateTransformer } from 'src/temporal-utils';
import { PersonalActionReminder } from './personal-action-reminder.entity';
import { ReminderCohortType } from './action-reminder.entity';
import { Group } from 'src/user/entities/group.entity';

@Entity()
export class ReminderGroup {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @Column()
  @ApiProperty()
  @Allow()
  name: string;

  @OneToMany(() => PersonalActionReminder, (reminder) => reminder.group)
  @ApiProperty({ type: PersonalActionReminder, isArray: true })
  @Allow()
  @Type(() => PersonalActionReminder)
  reminders: PersonalActionReminder[];

  @ManyToOne(() => ActionEvent, (event) => event.reminderGroups)
  @ApiProperty({ type: () => ActionEvent })
  @Type(() => ActionEvent)
  @IsDefined()
  memberActionEvent: ActionEvent;

  @ApiProperty({
    enum: ReminderCohortType,
    enumName: 'ReminderCohortType',
  })
  @Column({ type: 'enum', enum: ReminderCohortType, nullable: true })
  @Allow()
  cohortType: ReminderCohortType;

  @ManyToOne(() => Group)
  @ApiPropertyOptional({ type: () => Group })
  @Type(() => Group)
  @IsOptional()
  userGroup?: Group;

  @ApiProperty({ type: String })
  @Column({ type: 'text' })
  @IsDefined()
  emailMessage: string;

  @ApiProperty({ type: String })
  @Column({ type: 'text' })
  @IsDefined()
  emailSubject: string;

  @ApiProperty({ type: String })
  @Column({ type: 'text' })
  @IsDefined()
  textMessage: string;

  @ApiProperty({ type: String })
  @Column({ type: 'date', transformer: temporalPlainDateTransformer })
  @Allow()
  @Type(() => Temporal.PlainDate)
  sendDay: Temporal.PlainDate;

  @ApiProperty({ type: String })
  @Expose()
  get sendDayString(): string {
    return this.sendDay.toString();
  }

  @ApiPropertyOptional({ type: Boolean })
  @Expose()
  get allSent(): boolean | undefined {
    return this.reminders
      ? this.reminders.every(
          (reminder) => reminder.sentAt || reminder.skippedForCompletion,
        )
      : undefined;
  }
}
