import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReadatTimestamp1765416750764 implements MigrationInterface {
  name = 'ReadatTimestamp1765416750764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add the new column first (nullable)
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "readAt" TIMESTAMP`,
    );

    // 2. Backfill readAt for any previously read/cleared notifications
    //    Assuming Postgres; use NOW() or CURRENT_TIMESTAMP
    await queryRunner.query(`
            UPDATE "notification"
            SET "readAt" = NOW()
            WHERE "read" = true OR "cleared" = true
        `);

    // 3. Drop deprecated columns
    await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "read"`);
    await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "cleared"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Recreate the old columns
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "read" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "cleared" boolean NOT NULL DEFAULT false`,
    );

    // 2. Populate "read" from "readAt"; "cleared" stays false for all rows
    await queryRunner.query(`
            UPDATE "notification"
            SET "read" = true
            WHERE "readAt" IS NOT NULL
        `);

    // 3. Drop the new column
    await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "readAt"`);
  }
}
