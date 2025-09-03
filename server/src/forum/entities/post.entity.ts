import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow, IsNotEmpty, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Action } from '../../actions/entities/action.entity';
import { User } from '../../user/user.entity';
import { EditableContent } from './editablecontent.entity';

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

  @OneToOne(() => EditableContent, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @ApiProperty({ type: () => EditableContent })
  @Allow()
  @Type(() => EditableContent)
  editableContent: EditableContent;

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
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @Allow()
  actionId?: number;

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
