import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum DetectableEntity {
  Comment = 'comment',
  FormResponse = 'formResponse',
}

export enum DetectionStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

@Entity()
@Unique(['entityType', 'entityId', 'fieldPath'])
export class AiDetectionResult {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @Column({ type: 'enum', enum: DetectableEntity })
  @ApiProperty({ enum: DetectableEntity, enumName: 'DetectableEntity' })
  @Allow()
  entityType: DetectableEntity;

  @Column()
  @ApiProperty()
  @Allow()
  entityId: number;

  @Column({ type: 'text' })
  @ApiProperty()
  @Allow()
  fieldPath: string;

  @Column({
    type: 'enum',
    enum: DetectionStatus,
    default: DetectionStatus.Pending,
  })
  @ApiProperty({ enum: DetectionStatus, enumName: 'DetectionStatus' })
  @Allow()
  status: DetectionStatus;

  @Column({ type: 'float', nullable: true })
  @ApiPropertyOptional()
  @IsOptional()
  aiProbability?: number | null;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Object)
  rawApiResponse?: string | null;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  @IsOptional()
  modelVersion?: string | null;

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
