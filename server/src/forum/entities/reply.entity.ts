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
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../user/user.entity';
import { Post } from './post.entity';
import { Notification } from '../../notifs/entities/notification.entity';
import { Allow, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
@Entity()
export class Reply {
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

  @ManyToOne(() => Post, (post) => post.replies, { onDelete: 'CASCADE' })
  @JoinColumn()
  @ApiProperty({ type: () => Post })
  @Allow()
  @Type(() => Post)
  post: Post;

  @Column()
  @ApiProperty()
  @IsNotEmpty()
  postId: number;

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

  @ManyToOne(() => Reply, (reply) => reply.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @ApiProperty({ type: () => Reply, required: false })
  @Allow()
  @IsOptional()
  parent: Reply | null;

  @Column({ nullable: true })
  @IsOptional()
  @ApiPropertyOptional()
  parentId?: number;

  @OneToMany(() => Reply, (reply) => reply.parent)
  @ApiProperty({ type: () => Reply, required: false, isArray: true })
  @Allow()
  @Type(() => Reply)
  children: Reply[];

  @OneToOne(() => Notification, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @Allow()
  @Type(() => Notification)
  notification: Notification;
}
