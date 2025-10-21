import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';
import { ActionUpdate } from 'src/actions/entities/action-update.entity';

export enum NotificationCategory {
  ActionEvent = 'action_event',
  ForumReply = 'forum_reply',
  FriendRequest = 'friend_request',
  FriendRequestAccepted = 'friend_request_accepted',
  ActionUpdate = 'action_update',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => User, (user) => user.notifications, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  associatedUser?: User;

  @Column({ type: 'enum', enum: NotificationCategory })
  @ApiProperty({ enum: NotificationCategory, enumName: 'NotificationCategory' })
  category: NotificationCategory;

  @Column()
  @ApiProperty()
  message: string;

  @Column({ nullable: true })
  @ApiProperty({ nullable: true })
  webAppLocation: string;

  @Column({ nullable: true })
  @ApiProperty({ nullable: true })
  mobileAppLocation: string;

  @Column({ default: false })
  @ApiProperty()
  read: boolean;

  @Column({ default: false })
  @ApiProperty()
  cleared: boolean;

  @CreateDateColumnTz()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumnTz()
  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => ActionUpdate })
  @ManyToOne(() => ActionUpdate, (actionUpdate) => actionUpdate.notifs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  actionUpdate?: ActionUpdate;
}
