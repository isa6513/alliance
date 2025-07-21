import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClearableNotifsFix1753125000000 implements MigrationInterface {
  name = 'ClearableNotifsFix1753125000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /* --- action_activity FK (temporarily drop so we can re‑apply the CASCADE rule cleanly) --- */
    await queryRunner.query(`
      ALTER TABLE "action_activity"
      DROP CONSTRAINT "FK_451c6a1b9e6018fe21061aa8506";
    `);

    /* --- add “cleared” flag to notifications --- */
    await queryRunner.query(`
      ALTER TABLE "notification"
      ADD "cleared" boolean NOT NULL DEFAULT false;
    `);

    /* --- convert “category” column to a proper ENUM without losing data --- */
    await queryRunner.query(`
      CREATE TYPE "public"."notification_category_enum" AS ENUM
        ('action_event', 'forum_reply', 'action_invite',
         'friend_request', 'friend_request_accepted');
    `);

    /* change column type in‑place so existing rows keep their values */
    await queryRunner.query(`
      ALTER TABLE "notification"
      ALTER COLUMN "category"
      TYPE "public"."notification_category_enum"
      USING "category"::text::"public"."notification_category_enum";
    `);

    /* (re‑)enforce NOT‑NULL (already true, but explicit for clarity) */
    await queryRunner.query(`
      ALTER TABLE "notification"
      ALTER COLUMN "category" SET NOT NULL;
    `);

    /* --- restore FK with ON DELETE CASCADE --- */
    await queryRunner.query(`
      ALTER TABLE "action_activity"
      ADD CONSTRAINT "FK_451c6a1b9e6018fe21061aa8506"
      FOREIGN KEY ("userId") REFERENCES "user"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /* drop FK first */
    await queryRunner.query(`
      ALTER TABLE "action_activity"
      DROP CONSTRAINT "FK_451c6a1b9e6018fe21061aa8506";
    `);

    /* revert “category” back to varchar */
    await queryRunner.query(`
      ALTER TABLE "notification"
      ALTER COLUMN "category"
      TYPE character varying
      USING "category"::text;
    `);

    /* remove ENUM type */
    await queryRunner.query(`
      DROP TYPE "public"."notification_category_enum";
    `);

    /* drop “cleared” flag */
    await queryRunner.query(`
      ALTER TABLE "notification"
      DROP COLUMN "cleared";
    `);

    /* restore original FK behaviour (NO ACTION) */
    await queryRunner.query(`
      ALTER TABLE "action_activity"
      ADD CONSTRAINT "FK_451c6a1b9e6018fe21061aa8506"
      FOREIGN KEY ("userId") REFERENCES "user"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION;
    `);
  }
}
