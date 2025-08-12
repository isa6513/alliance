import { MigrationInterface, QueryRunner } from "typeorm";

export class Actionactivitycomments1754963631142 implements MigrationInterface {
    name = 'Actionactivitycomments1754963631142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "action_activity_comment" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted" boolean NOT NULL DEFAULT false, "activityId" integer, "authorId" integer, CONSTRAINT "PK_015f6a0d836728246f6b657cae0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "action_activity" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "action_activity" ADD "attachments" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TYPE "public"."recent_search_objecttype_enum" RENAME TO "recent_search_objecttype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."recent_search_objecttype_enum" AS ENUM('user', 'action', 'post', 'recent')`);
        await queryRunner.query(`ALTER TABLE "recent_search" ALTER COLUMN "objectType" TYPE "public"."recent_search_objecttype_enum" USING "objectType"::"text"::"public"."recent_search_objecttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."recent_search_objecttype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "action_activity_comment" ADD CONSTRAINT "FK_6dec6b0073a697cb8b61148f7ab" FOREIGN KEY ("activityId") REFERENCES "action_activity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_activity_comment" ADD CONSTRAINT "FK_873ad8a45a9345e6e6bf7395fb6" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_activity_comment" DROP CONSTRAINT "FK_873ad8a45a9345e6e6bf7395fb6"`);
        await queryRunner.query(`ALTER TABLE "action_activity_comment" DROP CONSTRAINT "FK_6dec6b0073a697cb8b61148f7ab"`);
        await queryRunner.query(`CREATE TYPE "public"."recent_search_objecttype_enum_old" AS ENUM('user', 'action', 'post')`);
        await queryRunner.query(`ALTER TABLE "recent_search" ALTER COLUMN "objectType" TYPE "public"."recent_search_objecttype_enum_old" USING "objectType"::"text"::"public"."recent_search_objecttype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."recent_search_objecttype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."recent_search_objecttype_enum_old" RENAME TO "recent_search_objecttype_enum"`);
        await queryRunner.query(`ALTER TABLE "action_activity" DROP COLUMN "attachments"`);
        await queryRunner.query(`ALTER TABLE "action_activity" DROP COLUMN "description"`);
        await queryRunner.query(`DROP TABLE "action_activity_comment"`);
    }

}
