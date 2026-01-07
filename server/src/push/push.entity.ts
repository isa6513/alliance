import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Push {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  expoPushToken: string;

  @CreateDateColumnTz()
  @ApiProperty()
  createdAt: Date;

  @Column()
  @ApiProperty()
  body: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  screen?: string;

  @UpdateDateColumnTz()
  @ApiProperty()
  updatedAt: Date;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  receiptId?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  ticketStatus?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  receiptStatus?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  errorCode?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  errorMessage?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  lastCheckedStatusAt?: Date;
}
