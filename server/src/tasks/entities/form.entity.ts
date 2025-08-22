// src/forms/form.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow, IsArray } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FormResponse } from './formresponse.entity';

@Entity()
export class Form {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @Column({ type: 'text' })
  @ApiProperty()
  @Allow()
  title: string;

  /** The JSON schema/DSL you render on the client */
  @Column({ type: 'jsonb' })
  @ApiProperty()
  @Allow()
  @Type(() => Object)
  schema!: Record<string, unknown>;

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

  @OneToMany(() => FormResponse, (r: FormResponse) => r.form)
  @Type(() => FormResponse)
  @IsArray()
  responses: FormResponse[];
}
