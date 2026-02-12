import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow, IsDefined, IsOptional } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';
import { GeneralUpdateActivity } from './general-update-activity.entity';
import { Ty } from 'src/tasks/entities/type';

@Entity()
export class GeneralUpdate {
  // Fields

  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @Column({ type: 'text' })
  @ApiProperty()
  @IsDefined()
  name: string;

  @Column({ type: 'jsonb' })
  @ApiProperty()
  @IsDefined()
  @Type(() => Object)
  schema!: Record<string, unknown>;

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

  @Column({ type: 'timestamptz' })
  @ApiProperty()
  @Type(() => Date)
  @Allow()
  startDate: Date;

  @Column({ type: 'timestamptz' })
  @ApiProperty()
  @Type(() => Date)
  @Allow()
  endDate: Date;

  // Relations

  @OneToMany(() => GeneralUpdateActivity, (activity) => activity.generalUpdate)
  @Type(() => GeneralUpdateActivity)
  @IsOptional()
  activities?: Ty<GeneralUpdateActivity>[];
}
