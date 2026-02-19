import { MigrationInterface, QueryRunner } from 'typeorm';

export class NoisyPostsUserS1771538216007 implements MigrationInterface {
  name = 'NoisyPostsUserS1771538216007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TYPE "public"."EmailType"
          ADD VALUE IF NOT EXISTS 'forum_reply'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."EmailType_old" AS ENUM('verification', 'password_reset', 'partial_signup', 'welcome', 'other', 'commitment', 'memberaction', 'commitmentreminder', 'memberactionreminder', 'forum_digest', 'missed_deadline', 'missed_second_deadline', 'custom_action_reminder', 'contract_suspended')`,
    );
    await queryRunner.query(
      `ALTER TABLE "mail" ALTER COLUMN "emailType" TYPE "public"."EmailType_old" USING "emailType"::"text"::"public"."EmailType_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."EmailType"`);
    await queryRunner.query(
      `ALTER TYPE "public"."EmailType_old" RENAME TO "EmailType"`,
    );
  }
}
