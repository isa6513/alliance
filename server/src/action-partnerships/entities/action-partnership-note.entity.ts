import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow, IsNotEmpty, IsString } from 'class-validator';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { ActionPartnershipResponse } from './action-partnership-response.entity';

@Entity()
export class ActionPartnershipNote {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @ManyToOne(() => ActionPartnershipResponse, (response) => response.notesHistory, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @Allow()
  @Type(() => ActionPartnershipResponse)
  response: ActionPartnershipResponse;

  @RelationId((note: ActionPartnershipNote) => note.response)
  @ApiProperty()
  @Allow()
  responseId: number;

  @Column({ type: 'timestamptz' })
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  noteDate: Date;

  @Column({ type: 'text' })
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string;

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
