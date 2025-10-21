import { MigrationInterface, QueryRunner } from "typeorm";

export class Actionupdates1761012485054 implements MigrationInterface {
    name = 'Actionupdates1761012485054'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."action_update_notifytype_enum" AS ENUM('none', 'bell_participants', 'bell_all_members')`);
        await queryRunner.query(`CREATE TABLE "action_update" ("id" SERIAL NOT NULL, "title" text NOT NULL, "displayDate" TIMESTAMP WITH TIME ZONE NOT NULL, "visibleAt" TIMESTAMP WITH TIME ZONE NOT NULL, "notifyType" "public"."action_update_notifytype_enum" NOT NULL DEFAULT 'none', "actionId" integer, "contentId" integer, "associatedEventId" integer, CONSTRAINT "PK_40d41e727317ac0cdc2d4e166a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "actionUpdateId" integer`);
        await queryRunner.query(`ALTER TYPE "public"."notification_category_enum" RENAME TO "notification_category_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_category_enum" AS ENUM('action_event', 'forum_reply', 'friend_request', 'friend_request_accepted', 'action_update')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "category" TYPE "public"."notification_category_enum" USING "category"::"text"::"public"."notification_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_category_enum_old"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_ca6c77e63273e35f3cdb07632f9" FOREIGN KEY ("actionUpdateId") REFERENCES "action_update"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_update" ADD CONSTRAINT "FK_6fc20f9c69f4283d5ef0c05d5ba" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_update" ADD CONSTRAINT "FK_891d217b99508a780a59d9e118c" FOREIGN KEY ("contentId") REFERENCES "editable_content"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_update" ADD CONSTRAINT "FK_cedb614899842fd9333b5695f39" FOREIGN KEY ("associatedEventId") REFERENCES "action_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_update" DROP CONSTRAINT "FK_cedb614899842fd9333b5695f39"`);
        await queryRunner.query(`ALTER TABLE "action_update" DROP CONSTRAINT "FK_891d217b99508a780a59d9e118c"`);
        await queryRunner.query(`ALTER TABLE "action_update" DROP CONSTRAINT "FK_6fc20f9c69f4283d5ef0c05d5ba"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_ca6c77e63273e35f3cdb07632f9"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_category_enum_old" AS ENUM('action_event', 'forum_reply', 'friend_request', 'friend_request_accepted')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "category" TYPE "public"."notification_category_enum_old" USING "category"::"text"::"public"."notification_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notification_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notification_category_enum_old" RENAME TO "notification_category_enum"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "actionUpdateId"`);
        await queryRunner.query(`DROP TABLE "action_update"`);
        await queryRunner.query(`DROP TYPE "public"."action_update_notifytype_enum"`);
    }

}
