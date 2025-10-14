import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';

export class CustomValidator {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  @Allow()
  id: number;
}
