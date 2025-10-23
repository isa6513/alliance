import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActionEvent } from './action-event.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow, IsDefined, IsOptional } from 'class-validator';
import { ActionEventNotif } from 'src/notifs/entities/action-event-notif.entity';

@Entity()
export class ActionReminder {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @ApiProperty({ type: () => ActionEvent })
  @ManyToOne(() => ActionEvent, (actionEvent) => actionEvent.customReminders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'memberActionEventId' })
  @Type(() => ActionEvent)
  @Allow()
  @IsDefined()
  memberActionEvent: ActionEvent;

  @ApiPropertyOptional({ type: () => ActionEvent })
  @ManyToOne(() => ActionEvent, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'deadlineEventId' })
  @Type(() => ActionEvent)
  @Allow()
  @IsOptional()
  deadlineEvent?: ActionEvent;

  @ApiProperty({ type: User, isArray: true })
  @Type(() => User)
  @Allow()
  @ManyToMany(() => User)
  @JoinTable()
  users: User[];

  @ApiPropertyOptional({ type: String })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @Allow()
  customEmailSubject?: string;

  @ApiPropertyOptional({ type: String })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  customEmailMessage?: string;

  @ApiPropertyOptional({ type: String })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  customTextMessage?: string;

  @ApiPropertyOptional({ type: Boolean })
  @Column({ type: 'boolean', default: false })
  @IsOptional()
  @Allow()
  includeActionLinkInMessages?: boolean;

  @ApiProperty({ type: Date })
  @Column({ type: 'timestamptz' })
  @IsDefined()
  @Type(() => Date)
  sendAt: Date;

  @ApiPropertyOptional({ type: Date, default: null })
  @Column({ type: 'timestamptz', nullable: true })
  @IsOptional()
  @Type(() => Date)
  sentAt?: Date;

  @OneToMany(() => ActionEventNotif, (notification) => notification.actionEvent)
  @ApiProperty({ type: ActionEventNotif, isArray: true })
  @IsDefined()
  @Type(() => ActionEventNotif)
  notifications: ActionEventNotif[];

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  createdAt: Date;
}
