import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CreateDateColumnTz,
  UpdateDateColumnTz,
} from 'src/datasources/basecolumns';
import { MessageStatus } from 'twilio/lib/rest/api/v2010/account/message';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Mms {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  to: string;

  @Column()
  @ApiProperty()
  from: string;

  @Column()
  @ApiProperty()
  body: string;

  @Column({ type: 'text' })
  @ApiProperty()
  status: MessageStatus;

  @Column()
  @ApiProperty()
  twilioSid: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  errorCode?: number;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  errorMessage?: string;

  @CreateDateColumnTz()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumnTz()
  @ApiProperty()
  updatedAt: Date;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  cid?: string;

  @Column({ default: false })
  @ApiProperty({ type: Boolean })
  clickedLink: boolean;
}
