import { PickType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { City } from './city.entity';
import { CityFieldValue } from '@alliance/common/forms/form-schema';
import { Assert } from '@alliance/common/types';

export class UserCity {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  latitude: number;
  @ApiProperty()
  longitude: number;
  @ApiPropertyOptional()
  country?: string;
  @ApiPropertyOptional()
  region?: string;
}

export class CitySearchDto extends PickType(City, [
  'id',
  'name',
  'countryName',
  'countryCode',
  'admin1',
]) {}

export class MaybeUserLocationDto {
  @ApiPropertyOptional({ type: () => City })
  @Type(() => City)
  city?: City;
}

type _typecheck = Assert<CitySearchDto extends CityFieldValue ? true : false>;
