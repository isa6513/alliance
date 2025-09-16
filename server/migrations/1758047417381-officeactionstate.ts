import { MigrationInterface, QueryRunner } from 'typeorm';

export class Officeactionstate1758047417381 implements MigrationInterface {
  name = 'Officeactionstate1758047417381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "action_event"
        ALTER COLUMN "newStatus" SET DEFAULT 'draft'
      `);

    await queryRunner.query(`
        ALTER TYPE "public"."action_event_newstatus_enum"
        RENAME VALUE 'commitments_reached' TO 'office_action'
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TYPE "public"."action_event_newstatus_enum"
            RENAME VALUE 'office_action' TO 'commitments_reached'
          `);

    await queryRunner.query(`
            ALTER TABLE "action_event"
            ALTER COLUMN "newStatus" SET DEFAULT 'draft'
          `);
  }
}
