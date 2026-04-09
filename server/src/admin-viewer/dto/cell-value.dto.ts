import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ColumnDataType } from './column-type.enum';

export class CellValueDto {
  @ApiProperty({
    description: 'The raw value from the database',
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'boolean' },
      { type: 'object' },
    ],
    nullable: true,
  })
  value: string | number | boolean | object | null;

  @ApiProperty({
    enum: ColumnDataType,
    enumName: 'ColumnDataType',
    description: 'The semantic type of this value',
  })
  type: ColumnDataType;

  @ApiPropertyOptional({
    description: 'Formatted display value for the frontend',
  })
  displayValue?: string;

  @ApiPropertyOptional({
    description: 'Target table for relation columns',
  })
  relationTarget?: string;
}