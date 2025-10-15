import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ColumnDataType } from './column-type.enum';

export class ColumnMetadataDto {
  @ApiProperty({
    description: 'Column name in the database',
  })
  name: string;

  @ApiProperty({
    enum: ColumnDataType,
    description: 'Semantic data type of the column',
    enumName: 'ColumnDataType',
  })
  dataType: ColumnDataType;

  @ApiProperty({
    description: 'Raw TypeORM column type',
  })
  rawType: string;

  @ApiProperty({
    description: 'Whether this is a primary key column',
  })
  isPrimary: boolean;

  @ApiProperty({
    description: 'Whether this column can contain null values',
  })
  isNullable: boolean;

  @ApiPropertyOptional({
    required: false,
    description: 'Target table name for relation columns',
  })
  relationTarget?: string;

  @ApiPropertyOptional({
    required: false,
    enum: ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'],
    description: 'Type of relation if this is a relation column',
  })
  relationType?: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

  @ApiPropertyOptional({
    required: false,
    isArray: true,
    description: 'Possible values for enum columns',
    type: String,
  })
  enumValues?: string[];
}
