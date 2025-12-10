import { Type } from 'class-transformer';
import { Ty } from 'src/tasks/entities/type';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Action } from './action.entity';

@Entity()
export class ActionShareUrl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Type(() => User)
  user: Ty<User>;

  @ManyToOne(() => Action, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actionId' })
  @Type(() => Action)
  action: Ty<Action>;

  @Column()
  @Type(() => Date)
  createdAt: Date;

  @Column()
  @Type(() => Date)
  updatedAt: Date;

  @Column({ type: 'jsonb' })
  @Type(() => Object)
  data: Record<string, unknown>;
}
