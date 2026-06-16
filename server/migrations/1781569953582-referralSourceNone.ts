import { MigrationInterface, QueryRunner } from "typeorm";

export class ReferralSourceNone1781569953582 implements MigrationInterface {
    name = 'ReferralSourceNone1781569953582'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."user_referralsource_enum" RENAME TO "user_referralsource_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_referralsource_enum" AS ENUM('referral_link', 'onetime_invite', 'action_share_link', 'external_share_link', 'invite_share_link', 'campaign', 'none')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" TYPE "public"."user_referralsource_enum" USING "referralSource"::"text"::"public"."user_referralsource_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" SET DEFAULT 'none'`);
        await queryRunner.query(`DROP TYPE "public"."user_referralsource_enum_old"`);

        // Re-attribute referrer-less accounts (seeded/founder accounts, or rows
        // whose referrer was deleted via the ON DELETE SET NULL FK) to 'none'.
        await queryRunner.query(`UPDATE "user" SET "referralSource" = 'none' WHERE "referredById" IS NULL AND "referralSource" IN ('referral_link', 'action_share_link', 'external_share_link', 'invite_share_link')`);

        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "CHK_user_referral_fields" CHECK (("referredByCampaignId" IS NULL OR "referralSource" = 'campaign')
   AND ("referredById" IS NULL OR "referralSource" IN ('referral_link', 'onetime_invite', 'action_share_link', 'external_share_link', 'invite_share_link'))
   AND ("referredByInviteId" IS NULL OR "referralSource" = 'onetime_invite'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "CHK_user_referral_fields"`);
        // 'none' is being removed from the enum; downgrade rows using it (the
        // prior default included) so the cast below doesn't fail.
        await queryRunner.query(`UPDATE "user" SET "referralSource" = 'referral_link' WHERE "referralSource" = 'none'`);
        await queryRunner.query(`CREATE TYPE "public"."user_referralsource_enum_old" AS ENUM('referral_link', 'onetime_invite', 'action_share_link', 'external_share_link', 'invite_share_link', 'campaign')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" TYPE "public"."user_referralsource_enum_old" USING "referralSource"::"text"::"public"."user_referralsource_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" SET DEFAULT 'referral_link'`);
        await queryRunner.query(`DROP TYPE "public"."user_referralsource_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_referralsource_enum_old" RENAME TO "user_referralsource_enum"`);
    }

}
