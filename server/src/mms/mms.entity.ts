import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageStatus } from 'twilio/lib/rest/api/v2010/account/message';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column()
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

  @CreateDateColumn()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ type: Date })
  updatedAt: Date;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  cid?: string;

  @Column({ default: false })
  @ApiProperty({ type: Boolean })
  clickedLink: boolean;
}
