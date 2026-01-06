import { MigrationInterface, QueryRunner } from 'typeorm';

export class SwitchToManualArray1767740780520 implements MigrationInterface {
  name = 'SwitchToManualArray1767740780520';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add the new array column
    await queryRunner.query(`
          ALTER TABLE "action"
          ADD COLUMN "manualCohortUserIds" integer[];
        `);

    // 2. Backfill from the existing join table
    await queryRunner.query(`
          UPDATE "action" a
          SET "manualCohortUserIds" = sub.user_ids
          FROM (
            SELECT
              acu."actionId" AS action_id,
              array_agg(acu."userId" ORDER BY acu."userId") AS user_ids
            FROM "action_manual_cohort_users_user" acu
            GROUP BY acu."actionId"
          ) sub
          WHERE a.id = sub.action_id;
        `);

    // Optional: ensure empty arrays instead of NULLs
    await queryRunner.query(`
          UPDATE "action"
          SET "manualCohortUserIds" = '{}'
          WHERE "manualCohortUserIds" IS NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "action"
          DROP COLUMN "manualCohortUserIds";
        `);
  }
}
