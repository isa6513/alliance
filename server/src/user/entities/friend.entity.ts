import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Notification } from '../../notifs/entities/notification.entity';
import { User } from './user.entity';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';
import { Ty } from 'src/tasks/entities/type';
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
  })
  requester: Ty<User>;

  /** User who received the request */
  @ManyToOne(() => User, (user) => user.receivedFriendRequests, {
    onDelete: 'CASCADE',
  })
  addressee: Ty<User>;

  @Column({ type: 'enum', enum: FriendStatus, default: FriendStatus.None })
  @ApiProperty({ enum: FriendStatus, enumName: 'FriendStatus' })
  status: FriendStatus;

  @CreateDateColumnTz()
  createdAt: Date;

  @Column({ nullable: true })
  acceptedAt?: Date;

  @UpdateDateColumnTz()
  updatedAt: Date;

  @OneToOne(() => Notification, {
    cascade: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  sentNotif: Notification | null;

  @OneToOne(() => Notification, {
    cascade: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  acceptedNotif: Notification | null;
}
