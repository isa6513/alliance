/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CitySearchDto } from './city.dto';
import { City } from './city.entity';
import { ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}

  async loadCountryDataFromTxt(): Promise<Record<string, string>> {
    const filePath = path.join(__dirname, 'countryInfo.txt');
    const countries: Record<string, string> = {};
    const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const lines = data.split('\n').filter((line) => !line.startsWith('#'));
    for (const line of lines) {
      const [ISO, ISO3, ISO_NUMERIC, fips, country] = line.split('\t', 5);
      countries[ISO] = country;
    }
    return countries;
  }

  async loadEnglishNames(): Promise<Record<number, string>> {
    const filePath = path.join(__dirname, 'alternateNames.txt');
    const englishMap: Record<number, string> = {};

    const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    const rl = readline.createInterface({ input: stream });

    for await (const line of rl) {
      const cols = line.split('\t');
      const geonameid = cols[1];
      const isolanguage = cols[2];
      const name = cols[3];

      if (isolanguage === 'en') {
        const id = parseInt(geonameid, 10);
        if (!englishMap[id]) englishMap[id] = name;
      }
    }

    return englishMap;
  }

  async loadCityDataFromTxt(): Promise<City[]> {
    const filePath = path.join(__dirname, 'cities5000.txt');

    const countries = await this.loadCountryDataFromTxt();

    const cities: City[] = [];
    const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const lines = data.split('\n').filter((line) => !line.startsWith('#'));

    const englishNames = await this.loadEnglishNames();

    for (const line of lines) {
      const [
        geonameid,
        name,
        asciiname,
        alternatenames,
        latitude,
        longitude,
        featureClass,
        featureCode,
        countryCode,
        cc2,
        admin1,
        admin2,
        admin3,
        admin4,
        population,
        elevation,
        dem,
        timezone,
        modificationDate,
      ] = line.split('\t');

      if (!geonameid) continue;

      cities.push({
        id: parseInt(geonameid),
        name: name,
        countryCode: countryCode,
        admin1: admin1,
        admin2: admin2,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        countryName: countries[countryCode],
        asciiName: asciiname,
        englishName: englishNames[parseInt(geonameid)] ?? null,
      });
    }

    for (let i = 0; i < cities.length; i += 500) {
      await this.cityRepository.save(
        cities.slice(i, Math.min(i + 500, cities.length)),
      );
    }

    return cities;
  }

  async searchCity(
    query: string,
    latitude?: number,
    longitude?: number,
  ): Promise<CitySearchDto[]> {
    const qb = this.cityRepository
      .createQueryBuilder('c')
      .where('(c.name ILIKE :q OR c.englishName ILIKE :q)', {
        q: `%${query}%`,
      });

    if (latitude != null && longitude != null) {
      qb.orderBy(
        '( (c.latitude  - :lat) * (c.latitude  - :lat) ' +
          '+ (c.longitude - :lon) * (c.longitude - :lon) )',
        'ASC',
      ).setParameters({ lat: latitude, lon: longitude });
    } else {
      qb.orderBy('c.name', 'ASC');
    }

    const cities = await qb.limit(10).getMany();
    return cities;
  }
}
