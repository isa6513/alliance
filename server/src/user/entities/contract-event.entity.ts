import { UpdateDateColumnTz } from 'src/datasources/basecolumns';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Contract } from 'src/contract/entities/contract.entity';
import type { Ty } from 'src/tasks/entities/type';
import { Allow, IsOptional } from 'class-validator';

export enum ContractEventType {
  SIGNED = 'signed',
  SUSPENDED = 'suspended',
}

@Entity()
@Index(['user', 'date'])
@Unique(['user', 'autoSuspendKey'])
export class ContractEvent {
  // Fields

  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @Column({ type: 'enum', enum: ContractEventType })
  @ApiProperty({ enum: ContractEventType, enumName: 'ContractEventType' })
  @Allow()
  type: ContractEventType;

  @Column({ type: 'timestamptz' })
  @ApiProperty()
  @Type(() => Date)
  @Allow()
  date: Date;

  @UpdateDateColumnTz()
  @Type(() => Date)
  @Allow()
  updatedAt: Date;

  @Column({ default: false })
  @ApiProperty()
  @Allow()
  automatic: boolean;

  @Column({ nullable: true })
  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  autoSuspendKey?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  signedName?: string;

  @Column()
  @ApiPropertyOptional()
  @IsOptional()
  contractId?: number;

  // Relations

  @ManyToOne(() => User, (user) => user.contractEvents, { onDelete: 'CASCADE' })
  @Allow()
  @Type(() => User)
  user: Ty<User>;

  @ManyToOne(() => Contract, (contract) => contract.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contractId' })
  @ApiPropertyOptional({
    type: () => Contract,
    nullable: true,
  })
  @Type(() => Contract)
  @IsOptional()
  contract?: Ty<Contract>;
}
