import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow, IsArray, IsOptional, IsString } from 'class-validator';
import { CreateDateColumnTz } from 'src/datasources/basecolumns';
import type { Ty } from 'src/tasks/entities/type';
import { ContractEvent } from 'src/user/entities/contract-event.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Contract {
  // Fields

  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;

  @CreateDateColumnTz()
  @ApiProperty()
  @Allow()
  @Type(() => Date)
  createdAt: Date;

  @Column()
  @ApiProperty()
  @IsString()
  markdown: string;

  @Column({ type: 'timestamptz', nullable: true })
  @ApiPropertyOptional()
  @Allow()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  @ApiPropertyOptional()
  @Allow()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  // Relations

  @OneToMany(() => ContractEvent, (event) => event.contract)
  @ApiProperty({
    type: () => ContractEvent,
    isArray: true,
  })
  @Allow()
  @IsArray()
  @Type(() => ContractEvent)
  events: Ty<ContractEvent>[];
}
