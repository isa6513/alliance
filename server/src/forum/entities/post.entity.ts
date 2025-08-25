import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow, IsNotEmpty } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Action } from '../../actions/entities/action.entity';
import { User } from '../../user/user.entity';

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

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
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
