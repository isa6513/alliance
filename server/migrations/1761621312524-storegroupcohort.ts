import { MigrationInterface, QueryRunner } from "typeorm";

export class Storegroupcohort1761621312524 implements MigrationInterface {
    name = 'Storegroupcohort1761621312524'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reminder_group_cohorttype_enum" AS ENUM('all_uncompleted', 'custom')`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD "cohortType" "public"."reminder_group_cohorttype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."ActionEventNotifType" RENAME TO "ActionEventNotifType_old"`);
        await queryRunner.query(`CREATE TYPE "public"."ActionEventNotifType" AS ENUM('announcement', 'misseddeadline', 'reminder', 'personalreminder')`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" TYPE "public"."ActionEventNotifType" USING "type"::"text"::"public"."ActionEventNotifType"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" SET DEFAULT 'announcement'`);
        await queryRunner.query(`DROP TYPE "public"."ActionEventNotifType_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ActionEventNotifType_old" AS ENUM('announcement', 'misseddeadline', 'reminder')`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" TYPE "public"."ActionEventNotifType_old" USING "type"::"text"::"public"."ActionEventNotifType_old"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" SET DEFAULT 'announcement'`);
        await queryRunner.query(`DROP TYPE "public"."ActionEventNotifType"`);
        await queryRunner.query(`ALTER TYPE "public"."ActionEventNotifType_old" RENAME TO "ActionEventNotifType"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP COLUMN "cohortType"`);
        await queryRunner.query(`DROP TYPE "public"."reminder_group_cohorttype_enum"`);
    }

}
