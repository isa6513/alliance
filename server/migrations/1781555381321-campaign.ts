import { MigrationInterface, QueryRunner } from 'typeorm';

export class Campaign1781555381321 implements MigrationInterface {
  name = 'Campaign1781555381321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "campaign" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "picture" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0ce34d26e7f2eb316a3a592cdc4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_78f57196031319c696bdd28d6d" ON "campaign" ("code") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "referredByCampaignId" integer`,
    );
    await queryRunner.query(`ALTER TABLE "share_url" ADD "campaignId" integer`);
    await queryRunner.query(
      `ALTER TYPE "public"."user_referralsource_enum" RENAME TO "user_referralsource_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_referralsource_enum" AS ENUM('referral_link', 'onetime_invite', 'action_share_link', 'external_share_link', 'campaign')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "referralSource" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "referralSource" TYPE "public"."user_referralsource_enum" USING "referralSource"::"text"::"public"."user_referralsource_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "referralSource" SET DEFAULT 'referral_link'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_referralsource_enum_old"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_share_url_campaign_external_target" ON "share_url" ("campaignId", "externalTargetId") WHERE "externalTargetId" IS NOT NULL AND "campaignId" IS NOT NULL AND "duplicate" = false`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_share_url_campaign_action" ON "share_url" ("campaignId", "actionId") WHERE "actionId" IS NOT NULL AND "campaignId" IS NOT NULL AND "duplicate" = false`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_url" ADD CONSTRAINT "CHK_share_url_owner" CHECK (("userId" IS NOT NULL AND "campaignId" IS NULL) OR ("userId" IS NULL AND "campaignId" IS NOT NULL))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_bf7b383402b636d95b137698862" FOREIGN KEY ("referredByCampaignId") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_url" ADD CONSTRAINT "FK_42db39d2f188290fb0bc028af35" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Retire dummy user 260 as a referral owner: replace it with a userless
    // campaign so both its share links AND the users it referred are
    // attributed to a "source" instead of a placeholder account. The
    // campaign inherits the dummy user's name and avatar so existing links
    // keep their branding. New signups via these links now resolve to the
    // campaign (see AuthService.resolveReferralCode).
    const dummyUsers: { name: string; profilePicture: string | null }[] =
      await queryRunner.query(
        `SELECT "name", "profilePicture" FROM "user" WHERE "id" = 260`,
      );
    const dummyLinks: { id: string }[] = await queryRunner.query(
      `SELECT "id" FROM "share_url" WHERE "userId" = 260`,
    );
    const dummyReferred: { id: number }[] = await queryRunner.query(
      `SELECT "id" FROM "user" WHERE "referredById" = 260`,
    );
    if (
      dummyUsers.length > 0 &&
      (dummyLinks.length > 0 || dummyReferred.length > 0)
    ) {
      const code = Math.random().toString(36).substring(2, 15);
      const inserted: { id: number }[] = await queryRunner.query(
        `INSERT INTO "campaign" ("name", "code", "picture") VALUES ($1, $2, $3) RETURNING "id"`,
        [dummyUsers[0].name, code, dummyUsers[0].profilePicture],
      );
      const campaignId = inserted[0].id;
      if (dummyLinks.length > 0) {
        await queryRunner.query(
          `UPDATE "share_url" SET "campaignId" = $1, "userId" = NULL WHERE "userId" = 260`,
          [campaignId],
        );
      }
      if (dummyReferred.length > 0) {
        await queryRunner.query(
          `UPDATE "user" SET "referredByCampaignId" = $1, "referredById" = NULL, "referralSource" = 'campaign' WHERE "referredById" = 260`,
          [campaignId],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore the dummy user as owner of any campaign-owned links and as
    // referrer of any campaign-attributed users before the campaign columns
    // are dropped, so no rows are left ownerless.
    await queryRunner.query(
      `UPDATE "share_url" SET "userId" = 260, "campaignId" = NULL WHERE "userId" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "user" SET "referredById" = 260, "referredByCampaignId" = NULL WHERE "referredByCampaignId" IS NOT NULL`,
    );
    // The 'campaign' enum value is being removed; downgrade any rows still
    // using it so the enum recreation cast below doesn't fail.
    await queryRunner.query(
      `UPDATE "user" SET "referralSource" = 'external_share_link' WHERE "referralSource" = 'campaign'`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_url" DROP CONSTRAINT "FK_42db39d2f188290fb0bc028af35"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_bf7b383402b636d95b137698862"`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_url" DROP CONSTRAINT "CHK_share_url_owner"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_share_url_campaign_action"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_share_url_campaign_external_target"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_referralsource_enum_old" AS ENUM('referral_link', 'onetime_invite', 'action_share_link', 'external_share_link')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "referralSource" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "referralSource" TYPE "public"."user_referralsource_enum_old" USING "referralSource"::"text"::"public"."user_referralsource_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "referralSource" SET DEFAULT 'referral_link'`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_referralsource_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."user_referralsource_enum_old" RENAME TO "user_referralsource_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "share_url" DROP COLUMN "campaignId"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "referredByCampaignId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_78f57196031319c696bdd28d6d"`,
    );
    await queryRunner.query(`DROP TABLE "campaign"`);
  }
}
