import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { Ty } from 'src/tasks/entities/type';
import { User } from 'src/user/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Message } from './message.entity';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';

export enum ParticipantRole {
  Admin = 'admin',
  Member = 'member',
  Owner = 'owner',
}

export enum ParticipantState {
  Invited = 'invited',
  Joined = 'joined',
}

@Entity()
export class Participant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.participants, {
    onDelete: 'CASCADE',
  })
  conversation: Ty<Conversation>;

  @ManyToOne(() => User, (user) => user.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Ty<User>;

  @Column({ type: 'enum', enum: ParticipantRole, enumName: 'ParticipantRole' })
  @ApiProperty({ enum: ParticipantRole, enumName: 'ParticipantRole' })
  role: ParticipantRole;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'lastReadMessageId' })
  @ApiPropertyOptional({ type: () => Message })
  lastReadMessage?: Ty<Message>;

  @Column({
    type: 'enum',
    enum: ParticipantState,
    enumName: 'ParticipantState',
    default: ParticipantState.Joined,
  })
  @ApiProperty({ enum: ParticipantState, enumName: 'ParticipantState' })
  state: ParticipantState;

  @Column({ type: 'timestamptz' })
  joinedAt: Date;

  @CreateDateColumnTz()
  createdAt: Date;

  @UpdateDateColumnTz()
  updatedAt: Date;
}
