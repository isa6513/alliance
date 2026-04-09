import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteRecordsDto {
  @ApiProperty({
    description: 'Array of primary key values for records to delete',
    example: [1, 2, 3],
    type: String,
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty()
  @Type(() => String)
  primaryKeyValues: (string | number)[];
}

export class DeleteRecordsResponseDto {
  @ApiProperty({
    description: 'Whether the deletion was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Descriptive message about the operation',
    example: 'Successfully deleted 3 records',
  })
  message: string;

  @ApiProperty({
    description: 'Number of records deleted',
    example: 3,
  })
  deletedCount: number;

  @ApiProperty({
    description: 'Array of primary key values that were successfully deleted',
    example: [1, 2, 3],
    type: String,
    isArray: true,
  })
  deletedIds: (string | number)[];

  @ApiPropertyOptional({
    description: 'Array of primary key values that failed to delete',
    example: [],
    type: String,
    isArray: true,
  })
  failedIds?: (string | number)[];
}