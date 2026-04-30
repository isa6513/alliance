import { Controller, Get, Query } from '@nestjs/common';
import { GeoService } from './geo.service';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { CitySearchDto } from './city.dto';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('search-city')
  @ApiQuery({ name: 'query', type: String, required: true })
  @ApiQuery({ name: 'latitude', type: Number, required: false })
  @ApiQuery({ name: 'longitude', type: Number, required: false })
  @ApiResponse({ type: [CitySearchDto] })
  async searchCity(
    @Query('query') query: string,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ): Promise<CitySearchDto[]> {
    return this.geoService.searchCity(query, latitude, longitude);
  }

  @Get('load-country-data')
  @ApiOkResponse()
  async loadCountryData(): Promise<void> {
    return this.geoService.loadCityDataFromTxt();
  }
}
