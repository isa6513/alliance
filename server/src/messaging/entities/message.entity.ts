import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';
import { User } from 'src/user/entities/user.entity';
import { Ty } from 'src/tasks/entities/type';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  body: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  @ApiProperty({ type: () => User })
  author: Ty<User>;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: Ty<Conversation>;

  @CreateDateColumnTz()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @UpdateDateColumnTz()
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  @ApiPropertyOptional({ type: Date })
  deletedAt?: Date;

  @ManyToOne(() => Message, (message) => message.replies)
  @JoinColumn({ name: 'replyToId' })
  @ApiProperty({ type: () => Message, required: false })
  replyTo: Message;

  @OneToMany(() => Message, (message) => message.replyTo)
  replies: Message[];
}
