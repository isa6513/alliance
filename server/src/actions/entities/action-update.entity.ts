import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Action } from './action.entity';
import { Type } from 'class-transformer';
import { Allow, IsNotEmpty, IsOptional } from 'class-validator';
import { ActionEvent } from './action-event.entity';
import { EditableContent } from 'src/forum/entities/editablecontent.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Notification } from 'src/notifs/entities/notification.entity';

export enum ActionUpdateNotifyType {
  None = 'none',
  BellParticipants = 'bell_participants',
  BellAllMembers = 'bell_all_members',
}

@Entity()
export class ActionUpdate {
  @PrimaryGeneratedColumn()
  @Allow()
  @ApiProperty()
  id: number;

  @ManyToOne(() => Action, (action) => action.updates)
  @JoinColumn({ name: 'actionId' })
  @Type(() => Action)
  @Allow()
  @ApiProperty({ type: () => Action })
  action: Action;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @Allow()
  @ApiProperty()
  title: string;

  @ManyToOne(() => EditableContent, { eager: true })
  @JoinColumn({ name: 'contentId' })
  @Type(() => EditableContent)
  @Allow()
  @ApiProperty()
  content: EditableContent;

  @Column({ type: 'timestamptz' })
  @IsNotEmpty()
  @Type(() => Date)
  @ApiProperty()
  displayDate: Date;

  @Column({ type: 'timestamptz' })
  @IsNotEmpty()
  @Type(() => Date)
  @ApiProperty()
  visibleAt: Date;

  @ManyToOne(() => ActionEvent, (event) => event.updates, { nullable: true })
  @JoinColumn({ name: 'associatedEventId' })
  @Type(() => ActionEvent)
  @ApiPropertyOptional({ type: () => ActionEvent })
  @IsOptional()
  associatedEvent?: ActionEvent;

  @Column({
    type: 'enum',
    enum: ActionUpdateNotifyType,
    default: ActionUpdateNotifyType.None,
  })
  @IsNotEmpty()
  @Allow()
  @ApiProperty({
    enum: ActionUpdateNotifyType,
    enumName: 'ActionUpdateNotifyType',
  })
  notifyType: ActionUpdateNotifyType;

  @OneToMany(() => Notification, (notif) => notif.actionUpdate)
  @Type(() => Notification)
  @ApiProperty({ type: () => Notification, isArray: true })
  @Allow()
  notifs: Notification[];
}
