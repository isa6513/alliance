import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotifSendTime1763578621003 implements MigrationInterface {
  name = 'NotifSendTime1763578621003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add column nullable first
    await queryRunner.query(`
            ALTER TABLE "notification" 
            ADD "sendTime" TIMESTAMP WITH TIME ZONE
        `);

    await queryRunner.query(`
            UPDATE "notification"
            SET "sendTime" = "createdAt"
            WHERE "sendTime" IS NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "notification"
            ALTER COLUMN "sendTime" SET NOT NULL,
            ALTER COLUMN "sendTime" SET DEFAULT now()
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "notification" DROP COLUMN "sendTime"
        `);
  }
}
