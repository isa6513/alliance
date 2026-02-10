import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow, IsOptional } from 'class-validator';
import { CreateDateColumnTz } from 'src/datasources/basecolumns';
import { Community } from 'src/community/entities/community.entity';
import { Ty } from 'src/tasks/entities/type';
import { Notification } from 'src/notifs/entities/notification.entity';

export enum OnetimeInviteStatus {
  REQUEST_PENDING = 'request_pending',
  REQUEST_REJECTED = 'request_rejected',
  LINK_UNUSED = 'link_unused',
  LINK_USED = 'link_used',
}

@Entity()
export class OnetimeInvite {
  // Fields

  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @Column()
  @ApiProperty()
  @Allow()
  invitee: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsOptional()
  inviteeDescription?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsOptional()
  info?: string;

  @ApiProperty()
  @Column()
  @Allow()
  code: string;

  @CreateDateColumnTz()
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: OnetimeInviteStatus,
  })
  @ApiProperty({
    enum: OnetimeInviteStatus,
    enumName: 'OnetimeInviteStatus',
  })
  @Allow()
  status: OnetimeInviteStatus;

  @Column({ type: 'timestamptz', nullable: true })
  @ApiProperty({ type: Date, nullable: true })
  @Type(() => Date)
  @IsOptional()
  deletedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  @ApiProperty({ type: Date, nullable: true })
  @Type(() => Date)
  @IsOptional()
  usedAt: Date | null;

  // Relations

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  @ApiProperty({ type: () => User })
  @Type(() => User)
  @JoinColumn({ name: 'invitingUserId' })
  @Allow()
  invitingUser: Ty<User>;

  @OneToOne(() => User, (user) => user.referredByInvite)
  @ApiProperty({ type: () => User, nullable: true })
  @Type(() => User)
  @IsOptional()
  invitedUser: Ty<User> | null;

  @RelationId((invite: OnetimeInvite) => invite.invitedUser)
  @Type(() => Number)
  @ApiPropertyOptional()
  @IsOptional()
  invitedUserId?: number;

  @ManyToOne(() => Community, (community) => community.invites, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @ApiPropertyOptional({ type: () => Community, nullable: true })
  @Type(() => Community)
  @JoinColumn({ name: 'communityId' })
  @IsOptional()
  community?: Ty<Community> | null;

  @RelationId((invite: OnetimeInvite) => invite.community)
  @Type(() => Number)
  @ApiPropertyOptional()
  @IsOptional()
  communityId?: number;

  @OneToMany(() => Notification, (notif) => notif.onetimeInvite)
  @Type(() => Notification)
  @ApiProperty({ type: () => Notification, isArray: true })
  @Allow()
  notifs: Ty<Notification>[];
}
