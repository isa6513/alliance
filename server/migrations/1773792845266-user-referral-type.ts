import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserReferralType1773792845266 implements MigrationInterface {
  name = 'UserReferralType1773792845266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_referralsource_enum" AS ENUM('referral_link', 'onetime_invite')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "referralSource" "public"."user_referralsource_enum"`,
    );
    await queryRunner.query(
      `UPDATE "user" SET "referralSource" = 'onetime_invite' WHERE "referredByInviteId" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "user" SET "referralSource" = 'referral_link' WHERE "referredByInviteId" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "referralSource" SET DEFAULT 'referral_link'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "referralSource" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "referralSource"`);
    await queryRunner.query(`DROP TYPE "public"."user_referralsource_enum"`);
  }
}
