import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskFormResponseForActivity1759626300624
  implements MigrationInterface
{
  name = 'TaskFormResponseForActivity1759626300624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Add nullable column first
    await queryRunner.query(`
          ALTER TABLE "action_activity"
          ADD COLUMN "taskFormResponseId" integer
        `);

    // 2) Backfill: for each action_activity, find a form_response that
    //    matches the activity's user AND the action's taskFormId.
    //    If multiple match, choose the lowest response id to be deterministic.
    //
    //    Schema assumptions used here:
    //    - action_activity has columns: "id", "actionId", "userId"
    //    - action has columns: "id", "taskFormId"
    //    - form_response has columns: "id", "formId", "userId"
    //
    //    If you prefer "latest" by createdAt, replace MIN(fr.id) with:
    //      (SELECT fr2.id FROM form_response fr2
    //       WHERE fr2."formId" = a."taskFormId"
    //         AND fr2."userId" = aa2."userId"
    //       ORDER BY fr2."createdAt" DESC NULLS LAST, fr2.id DESC
    //       LIMIT 1)
    await queryRunner.query(`
          WITH chosen AS (
            SELECT
              aa2.id            AS aa_id,
              MIN(fr.id)        AS fr_id
            FROM "action_activity" aa2
            JOIN "action" a
              ON a.id = aa2."actionId"
            JOIN "form_response" fr
              ON fr."formId" = a."taskFormId"
             AND fr."userId"  = aa2."userId"
            GROUP BY aa2.id
          )
          UPDATE "action_activity" aa
             SET "taskFormResponseId" = c.fr_id
          FROM chosen c
          WHERE aa.id = c.aa_id
            AND aa."taskFormResponseId" IS NULL
        `);

    // 3) Add constraints after data is populated
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
