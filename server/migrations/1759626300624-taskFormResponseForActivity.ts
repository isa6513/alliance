import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskFormResponseForActivity1759626300624
  implements MigrationInterface
{
  name = 'TaskFormResponseForActivity1759626300624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Add nullable column
    await queryRunner.query(`
      ALTER TABLE "action_activity"
      ADD COLUMN "taskFormResponseId" integer
    `);

    // 2) Backfill with de-duplication:
    //    - Match on (action.taskFormId, activity.userId)
    //    - If multiple activities map to the same form_response, keep only ONE
    //      activity (rn = 1) and leave the others NULL so the UNIQUE can be added.
    //    - Order the keeper by activity.createdAt ASC then id ASC.
    //      (If you don't have createdAt, this still works thanks to id.)
    await queryRunner.query(`
      WITH matches AS (
        SELECT
          aa2.id AS aa_id,
          fr.id  AS fr_id,
          ROW_NUMBER() OVER (
            PARTITION BY fr.id
            ORDER BY aa2."createdAt" ASC NULLS LAST, aa2.id ASC
          ) AS rn
        FROM "action_activity" aa2
        JOIN "action" a
          ON a.id = aa2."actionId"
        JOIN "form_response" fr
          ON fr."formId" = a."taskFormId"
         AND fr."userId"  = aa2."userId"
      ),
      chosen AS (
        SELECT aa_id, fr_id
        FROM matches
        WHERE rn = 1
      )
      UPDATE "action_activity" aa
         SET "taskFormResponseId" = c.fr_id
      FROM chosen c
      WHERE aa.id = c.aa_id
        AND aa."taskFormResponseId" IS NULL
    `);

    // 3) Constraints after data is clean
    await queryRunner.query(`
      ALTER TABLE "action_activity"
      ADD CONSTRAINT "UQ_9641dee187a19400c6fd1f716f7" UNIQUE ("taskFormResponseId")
    `);

    await queryRunner.query(`
      ALTER TABLE "action_activity"
      ADD CONSTRAINT "FK_9641dee187a19400c6fd1f716f7"
      FOREIGN KEY ("taskFormResponseId")
      REFERENCES "form_response"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "action_activity"
      DROP CONSTRAINT "FK_9641dee187a19400c6fd1f716f7"
    `);
    await queryRunner.query(`
      ALTER TABLE "action_activity"
      DROP CONSTRAINT "UQ_9641dee187a19400c6fd1f716f7"
    `);
    await queryRunner.query(`
      ALTER TABLE "action_activity"
      DROP COLUMN "taskFormResponseId"
    `);
  }
}
