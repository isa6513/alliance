import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';

export enum NotificationType {
  ActionEvent = 'action_event',
  ForumReply = 'forum_reply',
  FriendRequest = 'friend_request',
  FriendRequestAccepted = 'friend_request_accepted',
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

  @Column({ type: 'enum', enum: NotificationType })
  @ApiProperty({ enum: NotificationType, enumName: 'NotificationType' })
  category: NotificationType;

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

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;
}
