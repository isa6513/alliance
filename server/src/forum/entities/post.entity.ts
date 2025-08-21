import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/user.entity';
import { Action } from '../../actions/entities/action.entity';
import { Allow, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @Column()
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @Column('text')
  @ApiProperty()
  @IsNotEmpty()
  content: string;

  @ManyToOne(() => User)
  @JoinColumn()
  @ApiProperty()
  @Allow()
  @Type(() => User)
  author: User;

  @Column()
  @ApiProperty()
  @Allow()
  authorId: number;

  @ManyToOne(() => Action, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  @ApiProperty({ required: false, type: () => Action })
  @Allow()
  @Type(() => Action)
  action: Action;

  @Column({ nullable: true })
  @ApiProperty({ required: false })
  @Allow()
  actionId: number;

  @CreateDateColumn()
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  createdAt: Date;

  @Column({ default: false })
  @ApiProperty()
  @Allow()
  pinned: boolean;

  @UpdateDateColumn()
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  updatedAt: Date;

  @Column({ default: false })
  @ApiProperty()
  @Allow()
  deleted: boolean;
}
