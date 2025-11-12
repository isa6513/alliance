import { MigrationInterface, QueryRunner } from 'typeorm';

export class Associatedusers1762975989161 implements MigrationInterface {
  name = 'Associatedusers1762975989161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_3af9e645be42ee1aec1a10dc7be"`,
    );
    await queryRunner.query(`
            CREATE TABLE "notification_associated_users" (
              "notificationId" integer NOT NULL,
              "userId" integer NOT NULL,
              CONSTRAINT "PK_810ee49f737e22ffe0fc1bfcef1"
                PRIMARY KEY ("notificationId", "userId")
            )
          `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9413d47a9cc263e46230bb6e6d"
            ON "notification_associated_users" ("notificationId")
          `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9c50141afdd5ff547b39c6ea2a"
            ON "notification_associated_users" ("userId")
          `);

    // BACKFILL: copy the old single association into the new join table
    await queryRunner.query(`
            INSERT INTO "notification_associated_users" ("notificationId", "userId")
            SELECT n."id", n."associatedUserId"
            FROM "notification" n
            WHERE n."associatedUserId" IS NOT NULL
          `);

    // Remove old column
    await queryRunner.query(`
            ALTER TABLE "notification" DROP COLUMN "associatedUserId"
          `);

    // Add FKs for the new join table
    await queryRunner.query(`
            ALTER TABLE "notification_associated_users"
            ADD CONSTRAINT "FK_9413d47a9cc263e46230bb6e6dc"
            FOREIGN KEY ("notificationId") REFERENCES "notification"("id")
            ON DELETE CASCADE ON UPDATE CASCADE
          `);
    await queryRunner.query(`
            ALTER TABLE "notification_associated_users"
            ADD CONSTRAINT "FK_9c50141afdd5ff547b39c6ea2ae"
            FOREIGN KEY ("userId") REFERENCES "user"("id")
            ON DELETE CASCADE ON UPDATE CASCADE
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "notification_associated_users"
        DROP CONSTRAINT "FK_9c50141afdd5ff547b39c6ea2ae"
      `);
    await queryRunner.query(`
        ALTER TABLE "notification_associated_users"
        DROP CONSTRAINT "FK_9413d47a9cc263e46230bb6e6dc"
      `);

    // Re-introduce the old column
    await queryRunner.query(`
        ALTER TABLE "notification" ADD "associatedUserId" integer
      `);

    // RESTORE: pick one associated user per notification (MIN to be deterministic)
    await queryRunner.query(`
        UPDATE "notification" n
        SET "associatedUserId" = sub."userId"
        FROM (
          SELECT "notificationId", MIN("userId") AS "userId"
          FROM "notification_associated_users"
          GROUP BY "notificationId"
        ) sub
        WHERE n."id" = sub."notificationId"
      `);

    // Clean up the join table and indexes
    await queryRunner.query(`
        DROP INDEX "public"."IDX_9c50141afdd5ff547b39c6ea2a"
      `);
    await queryRunner.query(`
        DROP INDEX "public"."IDX_9413d47a9cc263e46230bb6e6d"
      `);
    await queryRunner.query(`
        DROP TABLE "notification_associated_users"
      `);

    // Restore the old FK behavior
    await queryRunner.query(`
        ALTER TABLE "notification"
        ADD CONSTRAINT "FK_3af9e645be42ee1aec1a10dc7be"
        FOREIGN KEY ("associatedUserId") REFERENCES "user"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION
      `);
  }
}
