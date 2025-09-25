import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Type } from 'class-transformer';
import { Action } from 'src/actions/entities/action.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @ManyToMany(() => User, (user) => user.groups)
  @ApiProperty({ type: () => User, isArray: true })
  @Allow()
  @JoinTable()
  @Type(() => User)
  users: User[];

  @ManyToMany(() => Action, (action) => action.participatingGroups)
  @ApiProperty({ type: () => Action, isArray: true })
  @Allow()
  @JoinTable()
  @Type(() => Action)
  participatingIn: Action[];

  @Column()
  @ApiProperty()
  @Allow()
  name: string;

  @Column()
  @ApiProperty()
  @Allow()
  description: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  @IsOptional()
  publicDisplayName?: string;

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
}
