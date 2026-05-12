import { MigrationInterface, QueryRunner } from "typeorm";

export class ShareExternalUrl1778544917310 implements MigrationInterface {
    name = 'ShareExternalUrl1778544917310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "external_share_target" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "url" character varying NOT NULL, "paramName" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ff8bbb4b1e2091d273582c661c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "action_share_url" RENAME TO "share_url"`);
        await queryRunner.query(`ALTER TABLE "share_url" DROP CONSTRAINT "UQ_536fac0e161e3f8708b44a7ca76"`);
        await queryRunner.query(`ALTER TABLE "share_url" DROP CONSTRAINT "FK_26313b4e81fe098c368a84cc07c"`);
        await queryRunner.query(`ALTER TABLE "share_url" DROP CONSTRAINT "FK_cdd9f4178c5ace26b273f684aee"`);
        await queryRunner.query(`ALTER TABLE "share_url" ADD CONSTRAINT "FK_9323d6d43d3db4f4eddba0baf05" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "share_url" ADD CONSTRAINT "FK_edbd8d3e7fc4e3277b54eb36052" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "share_url" ADD "externalTargetId" integer`);
        await queryRunner.query(`ALTER TABLE "share_url" ADD CONSTRAINT "FK_45ebbe50ad36d59b1458a1a21e8" FOREIGN KEY ("externalTargetId") REFERENCES "external_share_target"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "share_url" ADD CONSTRAINT "CHK_2831b4ef3eab9d378daf9efb81" CHECK (("actionId" IS NOT NULL AND "externalTargetId" IS NULL) OR ("actionId" IS NULL AND "externalTargetId" IS NOT NULL))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_share_url_user_action" ON "share_url" ("userId", "actionId") WHERE "actionId" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_share_url_user_external_target" ON "share_url" ("userId", "externalTargetId") WHERE "externalTargetId" IS NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."user_referralsource_enum" RENAME TO "user_referralsource_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_referralsource_enum" AS ENUM('referral_link', 'onetime_invite', 'action_share_link', 'external_share_link')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" TYPE "public"."user_referralsource_enum" USING "referralSource"::"text"::"public"."user_referralsource_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" SET DEFAULT 'referral_link'`);
        await queryRunner.query(`DROP TYPE "public"."user_referralsource_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_referralsource_enum_old" AS ENUM('referral_link', 'onetime_invite', 'action_share_link')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" TYPE "public"."user_referralsource_enum_old" USING "referralSource"::"text"::"public"."user_referralsource_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "referralSource" SET DEFAULT 'referral_link'`);
        await queryRunner.query(`DROP TYPE "public"."user_referralsource_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_referralsource_enum_old" RENAME TO "user_referralsource_enum"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_share_url_user_external_target"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_share_url_user_action"`);
        await queryRunner.query(`ALTER TABLE "share_url" DROP CONSTRAINT "CHK_2831b4ef3eab9d378daf9efb81"`);
        await queryRunner.query(`ALTER TABLE "share_url" DROP CONSTRAINT "FK_45ebbe50ad36d59b1458a1a21e8"`);
        await queryRunner.query(`ALTER TABLE "share_url" DROP COLUMN "externalTargetId"`);
        await queryRunner.query(`ALTER TABLE "share_url" DROP CONSTRAINT "FK_edbd8d3e7fc4e3277b54eb36052"`);
        await queryRunner.query(`ALTER TABLE "share_url" DROP CONSTRAINT "FK_9323d6d43d3db4f4eddba0baf05"`);
        await queryRunner.query(`ALTER TABLE "share_url" ADD CONSTRAINT "FK_cdd9f4178c5ace26b273f684aee" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "share_url" ADD CONSTRAINT "FK_26313b4e81fe098c368a84cc07c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "share_url" ADD CONSTRAINT "UQ_536fac0e161e3f8708b44a7ca76" UNIQUE ("actionId", "userId")`);
        await queryRunner.query(`ALTER TABLE "share_url" RENAME TO "action_share_url"`);
        await queryRunner.query(`DROP TABLE "external_share_target"`);
    }

}
