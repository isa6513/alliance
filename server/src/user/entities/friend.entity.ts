import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Notification } from '../../notifs/entities/notification.entity';
import { User } from './user.entity';
export enum FriendStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Declined = 'declined',
  None = 'none',
}

@Entity()
@Unique(['requester', 'addressee']) // a user can only request once per counterpart
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  /** User who initiated the request */
  @ManyToOne(() => User, (user) => user.sentFriendRequests, {
    onDelete: 'CASCADE',
    eager: true,
  })
  requester: User;

  /** User who received the request */
  @ManyToOne(() => User, (user) => user.receivedFriendRequests, {
    onDelete: 'CASCADE',
    eager: true,
  })
  addressee: User;

  @Column({ type: 'enum', enum: FriendStatus, default: FriendStatus.None })
  @ApiProperty({ enum: FriendStatus, enumName: 'FriendStatus' })
  status: FriendStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  acceptedAt?: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Notification, {
    cascade: true,
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  sentNotif: Notification | null;

  @OneToOne(() => Notification, {
    cascade: true,
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  acceptedNotif: Notification | null;
}
