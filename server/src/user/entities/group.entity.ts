import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsOptional } from 'class-validator';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Type } from 'class-transformer';
import { Action } from 'src/actions/entities/action.entity';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @ManyToMany(() => User, (user) => user.groups, {
    onDelete: 'CASCADE',
  })
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

  @CreateDateColumnTz()
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  createdAt: Date;

  @UpdateDateColumnTz()
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  updatedAt: Date;
}
