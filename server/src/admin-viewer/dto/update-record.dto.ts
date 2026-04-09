import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsOptional,
} from 'class-validator';

export class UpdateRecordDto {
  @ApiProperty({
    description: 'The primary key value of the record to update',
    example: '123',
  })
  @IsNotEmpty()
  primaryKeyValue: string | number;

  @ApiProperty({
    description: 'Object containing column names and their new values',
    example: { name: 'John Doe', email: 'john@example.com', active: true },
  })
  @IsNotEmpty()
  @IsObject()
  updates: Record<string, unknown>;
}

export class UpdateRecordResponseDto {
  @ApiProperty({
    description: 'Whether the update was successful',
    example: true,
  })
  @IsDefined()
  success: boolean;

  @ApiProperty({
    description: 'Success or error message',
    example: 'Record updated successfully',
  })
  @IsDefined()
  message: string;

  @ApiPropertyOptional({
    description: 'The updated record data',
  })
  @IsOptional()
  @IsObject()
  updatedRecord?: Record<string, unknown>;
}