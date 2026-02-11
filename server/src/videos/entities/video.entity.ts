import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';

@Entity()
export class Video {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  key: string;

  @Column()
  @ApiProperty()
  originalFilename: string;

  @Column()
  @ApiProperty()
  mime: string;

  @Column()
  @ApiProperty()
  size: number;

  @Column({ default: 'processing' })
  @ApiProperty()
  status: 'processing' | 'ready' | 'failed';

  @Column({ type: 'float', nullable: true })
  @ApiPropertyOptional()
  duration?: number;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  processingInfo?: Record<string, unknown> | null;

  @CreateDateColumnTz()
  dateCreated: Date;

  @UpdateDateColumnTz()
  dateUpdated: Date;
}
