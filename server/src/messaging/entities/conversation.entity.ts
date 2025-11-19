import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './message.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Message, (message) => message.conversation)
  @ApiProperty({ type: () => Message, isArray: true })
  messages: Ty<Message>[];

  @CreateDateColumnTz()
  createdAt: Date;

  @UpdateDateColumnTz()
  updatedAt: Date;
}
