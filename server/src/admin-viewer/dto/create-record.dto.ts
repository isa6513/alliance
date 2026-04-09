import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateRecordDto {
  @ApiProperty({
    description: 'Object containing column names and their values for the new record',
    example: { name: 'John Doe', email: 'john@example.com', active: true },
  })
  @IsNotEmpty()
  @IsObject()
  record: Record<string, unknown>;
}

export class CreateRecordResponseDto {
  @ApiProperty({
    description: 'Whether the insert was successful',
    example: true,
  })
  @IsDefined()
  success: boolean;

  @ApiProperty({
    description: 'Success or error message',
    example: 'Record created successfully',
  })
  @IsDefined()
  message: string;

  @ApiPropertyOptional({
    description: 'The created record data',
  })
  @IsOptional()
  @IsObject()
  createdRecord?: Record<string, unknown>;
}
