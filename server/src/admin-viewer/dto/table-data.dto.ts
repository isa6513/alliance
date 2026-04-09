import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsIn,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ColumnMetadataDto } from './column-metadata.dto';

export class TableDataQueryDto {
  @ApiPropertyOptional({
    default: 1,
    description: 'Page number for pagination',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    default: 50,
    description: 'Number of records per page',
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Column name to sort by',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
    default: 'ASC',
    description: 'Sort order',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional({
    description: 'Search term to filter results',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class TableDataDto {
  @ApiProperty({
    type: ColumnMetadataDto,
    isArray: true,
    description: 'Column metadata for the table',
  })
  columns: ColumnMetadataDto[];

  @ApiProperty({
    type: 'array',
    isArray: true,
    items: {
      type: 'array',
      items: {
        oneOf: [
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' },
          { type: 'object' },
          { type: 'null' },
        ],
      },
    },
    description:
      'Table rows data - each row is an array of values corresponding to columns',
  })
  rows: (string | number | boolean | object | null)[][];

  @ApiProperty({
    description: 'Total number of records in the table (before pagination)',
  })
  totalCount: number;

  @ApiProperty({
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    description: 'Number of records per page',
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
  })
  totalPages: number;
}
