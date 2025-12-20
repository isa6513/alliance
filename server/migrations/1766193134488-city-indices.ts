import { MigrationInterface, QueryRunner } from 'typeorm';

export class CityIndices1766193134488 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_city_name_trgm
  ON city
  USING gin ((lower(name)) gin_trgm_ops);`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_city_english_name_trgm
  ON city
  USING gin ((lower("englishName")) gin_trgm_ops);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_city_name_trgm;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_city_english_name_trgm;`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm;`);
  }
}
