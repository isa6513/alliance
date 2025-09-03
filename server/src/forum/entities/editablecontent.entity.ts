import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow, IsDefined, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class EditableContent {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @Column('text')
  @ApiProperty({ description: 'Markdown or plain text body' })
  @IsString()
  body: string;

  @Column({ type: 'jsonb', default: [] })
  @ApiProperty({
    type: String,
    isArray: true,
    description: 'Image keys attached to the content',
  })
  @IsDefined()
  attachments: string[];

  @CreateDateColumn()
  @Allow()
  @Type(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Allow()
  @Type(() => Date)
  updatedAt: Date;
}
