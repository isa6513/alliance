import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnonFormStats1766431028217 implements MigrationInterface {
  name = 'AnonFormStats1766431028217';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "daily_stats_record" ADD "anonFormSubmissions" integer NOT NULL DEFAULT '0'`,
    );

    await queryRunner.query(`
        WITH counts AS (
          SELECT
            dsr.id AS dsr_id,
            COUNT(fr.id)::int AS anon_count
          FROM "daily_stats_record" dsr
          LEFT JOIN "form_response" fr
            ON fr."userId" IS NULL
           AND fr."createdAt" < dsr."date"
          GROUP BY dsr.id
        )
        UPDATE "daily_stats_record" dsr
        SET "anonFormSubmissions" = counts.anon_count
        FROM counts
        WHERE dsr.id = counts.dsr_id
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "daily_stats_record" DROP COLUMN "anonFormSubmissions"`,
    );
  }
}
