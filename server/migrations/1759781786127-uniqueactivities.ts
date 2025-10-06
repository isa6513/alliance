import { MigrationInterface, QueryRunner } from 'typeorm';

export class Uniqueactivities1759781786127 implements MigrationInterface {
  name = 'Uniqueactivities1759781786127';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          WITH ranked AS (
            SELECT
              id,
              "userId",
              "actionId",
              "type",
              "taskFormResponseId",
              "createdAt",
              ROW_NUMBER() OVER (
                PARTITION BY "userId", "actionId", "type"
                ORDER BY
                  CASE WHEN "taskFormResponseId" IS NOT NULL THEN 0 ELSE 1 END,
                  "createdAt" ASC,
                  id ASC
              ) AS rn
            FROM "action_activity"
          ),
          losers AS (
            SELECT id
            FROM ranked
            WHERE rn > 1
          )
          DELETE FROM "action_activity" aa
          WHERE aa.id IN (SELECT id FROM losers);
        `);

    await queryRunner.query(`
          ALTER TABLE "action_activity"
          ADD CONSTRAINT "UQ_activity_user_action_type"
          UNIQUE ("userId", "actionId", "type")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "action_activity"
          DROP CONSTRAINT "UQ_activity_user_action_type"
        `);
  }
}
