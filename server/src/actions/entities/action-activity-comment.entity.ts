import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActionActivity } from './action-activity.entity';
import { User } from 'src/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ActionActivityComment {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @ManyToOne(() => ActionActivity, { onDelete: 'CASCADE' })
  @ApiProperty({ type: () => ActionActivity })
  activity: ActionActivity;

  @Column()
  @ApiProperty()
  content: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author: User;

  @ManyToMany(() => User, { onDelete: 'CASCADE' })
  @JoinTable()
  likes: User[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => ActionActivityComment, (comment) => comment.parent)
  @ApiProperty({ type: () => ActionActivityComment, isArray: true })
  children: ActionActivityComment[];

  @ApiProperty({
    type: () => ActionActivityComment,
    required: false,
    nullable: true,
  })
  parent: ActionActivityComment | null;
}
