import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SearchItemType } from './searchitem.dto';

@Entity()
export class RecentSearch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  objectId: number;

  @Column({
    type: 'enum',
    enum: SearchItemType,
  })
  objectType: SearchItemType;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
