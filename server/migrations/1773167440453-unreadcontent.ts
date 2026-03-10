import { MigrationInterface, QueryRunner } from "typeorm";

export class Unreadcontent1773167440453 implements MigrationInterface {
    name = 'Unreadcontent1773167440453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."unread_content_contenttype_enum" AS ENUM('action_event', 'forum_reply', 'action_update')`);
        await queryRunner.query(`CREATE TABLE "unread_content" ("id" SERIAL NOT NULL, "contentType" "public"."unread_content_contenttype_enum" NOT NULL, "contentId" integer NOT NULL, "groupingKey" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shouldPush" boolean NOT NULL DEFAULT true, "pushDispatchedAt" TIMESTAMP WITH TIME ZONE, "pushClaimedBy" character varying, "pushClaimedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_faa160afaf925fdd9d3fa51582d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "push" ADD "unreadContentId" integer`);
        await queryRunner.query(`ALTER TABLE "unread_content" ADD CONSTRAINT "FK_26976ee92fe5427744a944a5241" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "push" ADD CONSTRAINT "FK_26c7c04b4a77e15451d0402b98c" FOREIGN KEY ("unreadContentId") REFERENCES "unread_content"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push" DROP CONSTRAINT "FK_26c7c04b4a77e15451d0402b98c"`);
        await queryRunner.query(`ALTER TABLE "unread_content" DROP CONSTRAINT "FK_26976ee92fe5427744a944a5241"`);
        await queryRunner.query(`ALTER TABLE "push" DROP COLUMN "unreadContentId"`);
        await queryRunner.query(`DROP TABLE "unread_content"`);
        await queryRunner.query(`DROP TYPE "public"."unread_content_contenttype_enum"`);
    }

}
