import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  Allow,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActionPartnershipNote } from './action-partnership-note.entity';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

@Entity()
export class ActionPartnershipResponse {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @Column()
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  organizationName: string;

  @Column()
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  personName: string;

  @Column()
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  contact: string;

  @Column({ type: 'jsonb' })
  @ApiProperty({ isArray: true, type: String })
  @IsArray()
  @IsString({ each: true })
  outreachChannels: string[];

  @Column()
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  audienceSize: string;

  @Column({ type: 'text' })
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  desiredCollaboration: string;

  @Column({ type: 'text', default: '' })
  @ApiProperty()
  @Transform(trim)
  @IsString()
  notes: string;

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

  @OneToMany(() => ActionPartnershipNote, (note) => note.response)
  @Allow()
  @Type(() => ActionPartnershipNote)
  notesHistory: ActionPartnershipNote[];
}
