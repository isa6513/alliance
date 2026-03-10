import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Ty } from 'src/tasks/entities/type';
import { User } from '../../user/entities/user.entity';
import { Column } from 'typeorm';
import { CreateDateColumnTz } from 'src/datasources/basecolumns';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum UnreadContentType {
  ActionEvent = 'action_event',
  ForumReply = 'forum_reply',
  ActionUpdate = 'action_update',
}

@Entity()
export class UnreadContent {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Ty<User>;

  @Column({ type: 'enum', enum: UnreadContentType })
  @ApiProperty({ enum: UnreadContentType, enumName: 'UnreadContentType' })
  contentType: UnreadContentType;

  @Column()
  @ApiProperty()
  contentId: number;

  @Column({ nullable: true })
  groupingKey?: string;

  @CreateDateColumnTz()
  @ApiProperty({ type: Date })
  @Type(() => Date)
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ type: Date })
  @Type(() => Date)
  sendTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  @ApiPropertyOptional({ type: Date })
  @Type(() => Date)
  readAt?: Date;

  @Column({ default: true })
  @ApiProperty()
  shouldPush: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  @ApiPropertyOptional({ type: Date })
  @Type(() => Date)
  pushDispatchedAt?: Date;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  pushClaimedBy?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  pushClaimedAt?: Date;
}
