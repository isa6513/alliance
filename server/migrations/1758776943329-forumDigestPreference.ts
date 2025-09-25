import { MigrationInterface, QueryRunner } from "typeorm";

export class ForumDigestPreference1758776943329 implements MigrationInterface {
    name = 'ForumDigestPreference1758776943329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_forumdigestpreference_enum" AS ENUM('off', 'daily', 'weekly')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "forumDigestPreference" "public"."user_forumdigestpreference_enum" NOT NULL DEFAULT 'off'`);
        await queryRunner.query(`ALTER TYPE "public"."EmailType" RENAME TO "EmailType_old"`);
        await queryRunner.query(`CREATE TYPE "public"."EmailType" AS ENUM('verification', 'password_reset', 'partial_signup', 'welcome', 'other', 'commitment', 'memberaction', 'commitmentreminder', 'memberactionreminder', 'forum_digest')`);
        await queryRunner.query(`ALTER TABLE "mail" ALTER COLUMN "emailType" TYPE "public"."EmailType" USING "emailType"::"text"::"public"."EmailType"`);
        await queryRunner.query(`DROP TYPE "public"."EmailType_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."EmailType_old" AS ENUM('verification', 'password_reset', 'partial_signup', 'welcome', 'other', 'commitment', 'memberaction', 'commitmentreminder', 'memberactionreminder')`);
        await queryRunner.query(`ALTER TABLE "mail" ALTER COLUMN "emailType" TYPE "public"."EmailType_old" USING "emailType"::"text"::"public"."EmailType_old"`);
        await queryRunner.query(`DROP TYPE "public"."EmailType"`);
        await queryRunner.query(`ALTER TYPE "public"."EmailType_old" RENAME TO "EmailType"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "forumDigestPreference"`);
        await queryRunner.query(`DROP TYPE "public"."user_forumdigestpreference_enum"`);
    }

}
