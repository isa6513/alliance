import { MigrationInterface, QueryRunner } from "typeorm";

export class LeaderReminderAndSetting1770150462408 implements MigrationInterface {
    name = 'LeaderReminderAndSetting1770150462408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "remindAboutUncompletedGroupMembers" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TYPE "public"."reminder_group_cohorttype_enum" RENAME TO "reminder_group_cohorttype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."reminder_group_cohorttype_enum" AS ENUM('all_uncompleted', 'group_leads_with_uncompleted', 'tag', 'custom')`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ALTER COLUMN "cohortType" TYPE "public"."reminder_group_cohorttype_enum" USING "cohortType"::"text"::"public"."reminder_group_cohorttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reminder_group_cohorttype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reminder_group_cohorttype_enum_old" AS ENUM('all_uncompleted', 'custom', 'tag')`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ALTER COLUMN "cohortType" TYPE "public"."reminder_group_cohorttype_enum_old" USING "cohortType"::"text"::"public"."reminder_group_cohorttype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."reminder_group_cohorttype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."reminder_group_cohorttype_enum_old" RENAME TO "reminder_group_cohorttype_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "remindAboutUncompletedGroupMembers"`);
    }

}
