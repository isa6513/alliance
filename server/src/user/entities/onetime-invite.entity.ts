import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow } from 'class-validator';
import { CreateDateColumnTz } from 'src/datasources/basecolumns';

@Entity()
export class OnetimeInvite {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @Column()
  @ApiProperty()
  @Allow()
  invitee: string;

  @ApiProperty()
  @Column()
  @Allow()
  code: string;

  @ManyToOne(() => User)
  @ApiProperty({ type: () => User })
  @Type(() => User)
  @JoinColumn({ name: 'invitingUserId' })
  @Allow()
  invitingUser: User;

  @CreateDateColumnTz()
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  createdAt: Date;

  @Column({ default: true })
  @ApiProperty()
  @Allow()
  isValid: boolean;
}
