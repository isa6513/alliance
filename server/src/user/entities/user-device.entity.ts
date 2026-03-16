import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import type { Ty } from 'src/tasks/entities/type';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Unique(['expoPushToken'])
export class UserDevice {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @ManyToOne(() => User, (user) => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Ty<User>;

  @Column({ nullable: true })
  deviceType?: string;

  @Column({ nullable: true })
  expoPushToken?: string;

  @Column({ nullable: true })
  liveActivityPushToStartToken?: string;

  @UpdateDateColumnTz()
  updatedAt: Date;

  @CreateDateColumnTz()
  createdAt: Date;
}
