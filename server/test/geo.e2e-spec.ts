import * as request from 'supertest';
import { Repository } from 'typeorm';
import { createTestApp, TestContext } from './e2e-test-utils';
import { GeoModule } from 'src/geo/geo.module';
import { City } from 'src/geo/city.entity';

describe('Geo (e2e)', () => {
  let ctx: TestContext;
  let cityRepo: Repository<City>;

  beforeAll(async () => {
    ctx = await createTestApp([GeoModule]);
    cityRepo = ctx.dataSource.getRepository(City);

    await cityRepo.save(
      cityRepo.create({
        id: 999999,
        name: 'Palo Alto',
        admin1: 'California',
        admin2: 'Santa Clara',
        countryCode: 'US',
        latitude: 37.4419,
        longitude: -122.143,
        countryName: 'United States',
      }),
    );
  }, 50000);

  afterEach(async () => {
    await cityRepo.query('DELETE FROM city WHERE id = 999999');
    await cityRepo.save(
      cityRepo.create({
        id: 999999,
        name: 'Palo Alto',
        admin1: 'California',
        admin2: 'Santa Clara',
        countryCode: 'US',
        latitude: 37.4419,
        longitude: -122.143,
        countryName: 'United States',
      }),
    );
  });

  afterAll(async () => {
    await cityRepo.query('DELETE FROM city WHERE id = 999999');
    await ctx.app.close();
  });

  it('searches for nearby cities by name', async () => {
    const cities = await request(ctx.app.getHttpServer())
      .get('/geo/search-city')
      .query({ query: 'Palo', latitude: 37.4, longitude: -122.1 })
      .expect(200);

    expect(cities.body.some((city) => city.name === 'Palo Alto')).toBe(true);
  });

  it('loads country data into the database', async () => {
    const response = await request(ctx.app.getHttpServer())
      .get('/geo/load-country-data')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
