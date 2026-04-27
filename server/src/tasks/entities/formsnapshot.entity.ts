import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow, IsDefined } from 'class-validator';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { CreateDateColumnTz } from 'src/datasources/basecolumns';

export const FORM_SNAPSHOT_HISTORY_TABLE = 'form_snapshot_history';

// Immutable snapshot of a form schema.
@Entity()
@Index('IDX_form_snapshot_hash', ['hash'], { unique: true })
export class FormSnapshot {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @Column({ type: 'jsonb' })
  @ApiProperty()
  @IsDefined()
  @Type(() => Object)
  schema: Record<string, unknown>;

  @Column({ type: 'text' })
  @ApiProperty()
  @Allow()
  hash: string;

  @CreateDateColumnTz()
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  createdAt: Date;
}
