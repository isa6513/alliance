import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../user/user.entity';
import { Notification } from '../../notifs/entities/notification.entity';
import { Allow, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum CommentParentObject {
  Post = 'post',
  Action = 'action',
  Activity = 'activity',
}

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

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

  @Column({ type: 'enum', enum: CommentParentObject })
  @ApiProperty({
    enum: CommentParentObject,
    enumName: 'CommentParentObject',
  })
  @Allow()
  parentObjectType: CommentParentObject;

  @Column()
  @ApiProperty()
  @IsNotEmpty()
  parentObjectId: number;

  @Column({ default: false })
  @ApiProperty()
  @Allow()
  deleted: boolean;

  @CreateDateColumn()
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  updatedAt: Date;

  @ManyToOne(() => Comment, (comment) => comment.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @ApiProperty({ type: () => Comment, required: false })
  @Allow()
  @IsOptional()
  parent: Comment | null;

  @Column({ nullable: true })
  @IsOptional()
  @ApiPropertyOptional()
  parentId?: number;

  @OneToMany(() => Comment, (comment) => comment.parent)
  @ApiProperty({ type: () => Comment, required: false, isArray: true })
  @Allow()
  @Type(() => Comment)
  children: Comment[];

  @OneToOne(() => Notification, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @Allow()
  @Type(() => Notification)
  notification: Notification;

  @Column({ default: false })
  @ApiProperty()
  @Allow()
  pinned: boolean;

  @ManyToMany(() => User, { onDelete: 'CASCADE', eager: true })
  @ApiProperty({ type: () => User, isArray: true })
  @JoinTable()
  @Allow()
  @Type(() => User)
  likes: User[];
}
