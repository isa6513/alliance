import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Action } from './action.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ReminderGroup } from './reminder-group.entity';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';
import { ActionEvent } from './action-event.entity';
import type { Ty } from 'src/tasks/entities/type';
import { GeneralUpdate } from './general-update.entity';

@Entity()
export class ActionSuite {
  // Fields

  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @Column()
  @ApiProperty()
  @Allow()
  name: string;

  @CreateDateColumnTz()
  @ApiProperty()
  @Type(() => Date)
  @Allow()
  createdAt: Date;

  @UpdateDateColumnTz()
  @ApiProperty()
  @Type(() => Date)
  @Allow()
  updatedAt: Date;

  // Relations

  @OneToMany(() => Action, (action) => action.suite)
  @ApiProperty({ type: () => Action, isArray: true })
  @Allow()
  @Type(() => Action)
  actions: Ty<Action>[];

  @OneToMany(() => GeneralUpdate, (generalUpdate) => generalUpdate.suite)
  @ApiProperty({ type: () => GeneralUpdate, isArray: true })
  @Allow()
  @Type(() => GeneralUpdate)
  generalUpdates: Ty<GeneralUpdate>[];

  @OneToMany(() => ReminderGroup, (reminderGroup) => reminderGroup.actionSuite)
  @ApiProperty({ type: () => ReminderGroup, isArray: true })
  @Allow()
  @Type(() => ReminderGroup)
  reminderGroups: Ty<ReminderGroup>[];

  // Methods

  @Expose()
  @ApiProperty({ type: () => ActionEvent, isArray: true })
  get events(): ActionEvent[] {
    return this.actions?.length
      ? this.actions[0].events.filter((event) => event.suiteManaged)
      : [];
  }
}
