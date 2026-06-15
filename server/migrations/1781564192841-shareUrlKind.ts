import { MigrationInterface, QueryRunner } from "typeorm";

export class ShareUrlKind1781564192841 implements MigrationInterface {
    name = 'ShareUrlKind1781564192841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add the `kind` enum column, backfilled from whichever target FK is set.
        await queryRunner.query(`CREATE TYPE "public"."share_url_kind_enum" AS ENUM('action', 'externalTarget', 'invite')`);
        await queryRunner.query(`ALTER TABLE "share_url" ADD "kind" "public"."share_url_kind_enum"`);
        await queryRunner.query(`UPDATE "share_url" SET "kind" = CASE WHEN "actionId" IS NOT NULL THEN 'action'::"public"."share_url_kind_enum" ELSE 'externalTarget'::"public"."share_url_kind_enum" END`);
        await queryRunner.query(`ALTER TABLE "share_url" ALTER COLUMN "kind" SET NOT NULL`);

        // Replace the anonymous action/external XOR check with a kind-aware one
        // that also permits invite rows (neither target FK set).
        await queryRunner.query(`ALTER TABLE "share_url" DROP CONSTRAINT "CHK_2831b4ef3eab9d378daf9efb81"`);
        await queryRunner.query(`ALTER TABLE "share_url" ADD CONSTRAINT "CHK_share_url_kind" CHECK (("kind" = 'action' AND "actionId" IS NOT NULL AND "externalTargetId" IS NULL) OR ("kind" = 'externalTarget' AND "externalTargetId" IS NOT NULL AND "actionId" IS NULL) OR ("kind" = 'invite' AND "actionId" IS NULL AND "externalTargetId" IS NULL))`);

        // One canonical invite link per owner (duplicates still allowed).
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_share_url_user_invite" ON "share_url" ("userId") WHERE "kind" = 'invite' AND "userId" IS NOT NULL AND "duplicate" = false`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_share_url_campaign_invite" ON "share_url" ("campaignId") WHERE "kind" = 'invite' AND "campaignId" IS NOT NULL AND "duplicate" = false`);

        // Invite signups are attributed via a new referral source.
        await queryRunner.query(`ALTER TYPE "public"."user_referralsource_enum" RENAME TO "user_referralsource_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_referralsource_enum" AS ENUM('referral_link', 'onetime_invite', 'action_share_link', 'external_share_link', 'invite_share_link', 'campaign')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" TYPE "public"."user_referralsource_enum" USING "referralSource"::"text"::"public"."user_referralsource_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" SET DEFAULT 'referral_link'`);
        await queryRunner.query(`DROP TYPE "public"."user_referralsource_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."user_referralsource_enum" RENAME TO "user_referralsource_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_referralsource_enum" AS ENUM('referral_link', 'onetime_invite', 'action_share_link', 'external_share_link', 'campaign')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" TYPE "public"."user_referralsource_enum" USING "referralSource"::"text"::"public"."user_referralsource_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" SET DEFAULT 'referral_link'`);
        await queryRunner.query(`DROP TYPE "public"."user_referralsource_enum_old"`);

        await queryRunner.query(`DROP INDEX "public"."UQ_share_url_campaign_invite"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_share_url_user_invite"`);

        await queryRunner.query(`ALTER TABLE "share_url" DROP CONSTRAINT "CHK_share_url_kind"`);
        await queryRunner.query(`ALTER TABLE "share_url" ADD CONSTRAINT "CHK_2831b4ef3eab9d378daf9efb81" CHECK (("actionId" IS NOT NULL AND "externalTargetId" IS NULL) OR ("actionId" IS NULL AND "externalTargetId" IS NOT NULL))`);

        await queryRunner.query(`ALTER TABLE "share_url" DROP COLUMN "kind"`);
        await queryRunner.query(`DROP TYPE "public"."share_url_kind_enum"`);
    }

}
