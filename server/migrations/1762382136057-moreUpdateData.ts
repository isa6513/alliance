import { MigrationInterface, QueryRunner } from "typeorm";

export class MoreUpdateData1762382136057 implements MigrationInterface {
    name = 'MoreUpdateData1762382136057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_update" ADD "shortNotifString" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "action_update" ADD "groupId" integer`);
        await queryRunner.query(`ALTER TYPE "public"."action_update_notifytype_enum" RENAME TO "action_update_notifytype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."action_update_notifytype_enum" AS ENUM('none', 'action_cohort', 'all_members', 'group')`);
        await queryRunner.query(`ALTER TABLE "action_update" ALTER COLUMN "notifyType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "action_update" ALTER COLUMN "notifyType" TYPE "public"."action_update_notifytype_enum" USING "notifyType"::"text"::"public"."action_update_notifytype_enum"`);
        await queryRunner.query(`ALTER TABLE "action_update" ALTER COLUMN "notifyType" SET DEFAULT 'none'`);
        await queryRunner.query(`DROP TYPE "public"."action_update_notifytype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "action_update" ADD CONSTRAINT "FK_ad84b8165f92de9a2e0d63494e7" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_update" DROP CONSTRAINT "FK_ad84b8165f92de9a2e0d63494e7"`);
        await queryRunner.query(`CREATE TYPE "public"."action_update_notifytype_enum_old" AS ENUM('none', 'bell_participants', 'bell_all_members')`);
        await queryRunner.query(`ALTER TABLE "action_update" ALTER COLUMN "notifyType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "action_update" ALTER COLUMN "notifyType" TYPE "public"."action_update_notifytype_enum_old" USING "notifyType"::"text"::"public"."action_update_notifytype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "action_update" ALTER COLUMN "notifyType" SET DEFAULT 'none'`);
        await queryRunner.query(`DROP TYPE "public"."action_update_notifytype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."action_update_notifytype_enum_old" RENAME TO "action_update_notifytype_enum"`);
        await queryRunner.query(`ALTER TABLE "action_update" DROP COLUMN "groupId"`);
        await queryRunner.query(`ALTER TABLE "action_update" DROP COLUMN "shortNotifString"`);
    }

}
