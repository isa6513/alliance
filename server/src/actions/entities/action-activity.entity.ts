import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Action } from './action.entity';
import { User } from '../../user/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum ActionActivityType {
  USER_JOINED = 'user_joined',
  USER_COMPLETED = 'user_completed',
}

@Entity()
export class ActionActivity {
  @PrimaryGeneratedColumn()
  @Allow()
  @ApiProperty()
  id: number;

  @Column({ type: 'enum', enum: ActionActivityType })
  @ApiProperty({
    description: 'Type of action activity',
    enum: ActionActivityType,
    enumName: 'ActionActivityType',
  })
  @Allow()
  type: ActionActivityType;

  @ManyToOne(() => Action, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actionId' })
  @Allow()
  @Type(() => Action)
  action: Action;

  @Column()
  @ApiProperty()
  @Allow()
  actionId: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Allow()
  @Type(() => User)
  user: User;

  @Column()
  @Allow()
  @ApiProperty()
  userId: number;

  @CreateDateColumn()
  @Allow()
  @Type(() => Date)
  @ApiProperty()
  createdAt: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  metadata?: string;

  // just for donation-based actions
  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsOptional()
  dollar_amount?: number;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @Column({ type: 'jsonb', default: [] })
  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  attachments?: string[];

  @ManyToMany(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinTable()
  @Allow()
  @ApiProperty({ type: () => User, isArray: true })
  @Type(() => User)
  likes: User[];
}
