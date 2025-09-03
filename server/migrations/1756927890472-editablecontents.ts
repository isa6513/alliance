import { MigrationInterface, QueryRunner } from 'typeorm';

export class Test1756927890472 implements MigrationInterface {
  name = 'Test1756927890472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "editable_content" (
          "id" SERIAL PRIMARY KEY,
          "body" text NOT NULL,
          "attachments" jsonb NOT NULL DEFAULT '[]',
          "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
          "origin_comment_id" integer,
          "origin_post_id" integer,
          "origin_action_activity_id" integer
        )
      `);

    // Backfill from comment
    await queryRunner.query(`
        INSERT INTO "editable_content" ("body", "attachments", "origin_comment_id")
        SELECT "content", COALESCE("attachments", '[]'::jsonb), "id" FROM "comment"
      `);

    // Backfill from post (no attachments previously)
    await queryRunner.query(`
        INSERT INTO "editable_content" ("body", "attachments", "origin_post_id")
        SELECT "content", '[]'::jsonb, "id" FROM "post"
      `);

    // Backfill from action_activity (use description + attachments if present)
    await queryRunner.query(`
        INSERT INTO "editable_content" ("body", "attachments", "origin_action_activity_id")
        SELECT COALESCE("description", ''), COALESCE("attachments", '[]'::jsonb), "id" FROM "action_activity"
      `);

    // Add relation columns
    await queryRunner.query(
      `ALTER TABLE "comment" ADD COLUMN "editableContentId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "post" ADD COLUMN "editableContentId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity" ADD COLUMN "editableContentId" integer`,
    );

    // Map relations from origin ids
    await queryRunner.query(`
        UPDATE "comment" c SET "editableContentId" = ec.id
        FROM "editable_content" ec
        WHERE ec.origin_comment_id = c.id
      `);
    await queryRunner.query(`
        UPDATE "post" p SET "editableContentId" = ec.id
        FROM "editable_content" ec
        WHERE ec.origin_post_id = p.id
      `);
    await queryRunner.query(`
        UPDATE "action_activity" a SET "editableContentId" = ec.id
        FROM "editable_content" ec
        WHERE ec.origin_action_activity_id = a.id
      `);

    // Add foreign keys and not-null where appropriate
    await queryRunner.query(`
        ALTER TABLE "comment"
        ALTER COLUMN "editableContentId" SET NOT NULL,
        ADD CONSTRAINT "FK_comment_editable_content" FOREIGN KEY ("editableContentId") REFERENCES "editable_content"("id") ON DELETE CASCADE
      `);
    await queryRunner.query(`
        ALTER TABLE "post"
        ALTER COLUMN "editableContentId" SET NOT NULL,
        ADD CONSTRAINT "FK_post_editable_content" FOREIGN KEY ("editableContentId") REFERENCES "editable_content"("id") ON DELETE CASCADE
      `);
    await queryRunner.query(`
        ALTER TABLE "action_activity"
        ADD CONSTRAINT "FK_action_activity_editable_content" FOREIGN KEY ("editableContentId") REFERENCES "editable_content"("id") ON DELETE CASCADE
      `);

    // Drop old columns now that content is migrated
    await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "content"`);
    await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "attachments"`);
    await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "content"`);
    // action_activity legacy columns
    await queryRunner.query(
      `ALTER TABLE "action_activity" DROP COLUMN IF EXISTS "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity" DROP COLUMN IF EXISTS "attachments"`,
    );

    // Remove origin mapping columns from editable_content
    await queryRunner.query(
      `ALTER TABLE "editable_content" DROP COLUMN "origin_comment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "editable_content" DROP COLUMN "origin_post_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "editable_content" DROP COLUMN "origin_action_activity_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add old columns
    await queryRunner.query(`ALTER TABLE "comment" ADD COLUMN "content" text`);
    await queryRunner.query(
      `ALTER TABLE "comment" ADD COLUMN "attachments" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "post" ADD COLUMN "content" text NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity" ADD COLUMN "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity" ADD COLUMN "attachments" jsonb NOT NULL DEFAULT '[]'`,
    );

    // Populate old columns from editable_content
    await queryRunner.query(`
      UPDATE "comment" c SET "content" = ec.body, "attachments" = ec.attachments
      FROM "editable_content" ec
      WHERE c."editableContentId" = ec.id
    `);
    await queryRunner.query(`
      UPDATE "post" p SET "content" = ec.body
      FROM "editable_content" ec
      WHERE p."editableContentId" = ec.id
    `);
    await queryRunner.query(`
      UPDATE "action_activity" a SET "description" = ec.body, "attachments" = ec.attachments
      FROM "editable_content" ec
      WHERE a."editableContentId" = ec.id
    `);

    // Drop FKs and relation columns
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT IF EXISTS "FK_comment_editable_content"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post" DROP CONSTRAINT IF EXISTS "FK_post_editable_content"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity" DROP CONSTRAINT IF EXISTS "FK_action_activity_editable_content"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "editableContentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post" DROP COLUMN "editableContentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity" DROP COLUMN "editableContentId"`,
    );

    // Finally drop editable_content
    await queryRunner.query(`DROP TABLE IF EXISTS "editable_content"`);
  }
}
