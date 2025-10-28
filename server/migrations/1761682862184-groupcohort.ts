import { MigrationInterface, QueryRunner } from "typeorm";

export class Groupcohort1761682862184 implements MigrationInterface {
    name = 'Groupcohort1761682862184'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD "userGroupId" integer`);
        await queryRunner.query(`ALTER TYPE "public"."action_reminder_cohorttype_enum" RENAME TO "action_reminder_cohorttype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."action_reminder_cohorttype_enum" AS ENUM('all_uncompleted', 'group', 'custom')`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "cohortType" TYPE "public"."action_reminder_cohorttype_enum" USING "cohortType"::"text"::"public"."action_reminder_cohorttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."action_reminder_cohorttype_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."reminder_group_cohorttype_enum" RENAME TO "reminder_group_cohorttype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."reminder_group_cohorttype_enum" AS ENUM('all_uncompleted', 'group', 'custom')`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ALTER COLUMN "cohortType" TYPE "public"."reminder_group_cohorttype_enum" USING "cohortType"::"text"::"public"."reminder_group_cohorttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reminder_group_cohorttype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD CONSTRAINT "FK_566d48f4c9ce5594bb63a96790c" FOREIGN KEY ("userGroupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP CONSTRAINT "FK_566d48f4c9ce5594bb63a96790c"`);
        await queryRunner.query(`CREATE TYPE "public"."reminder_group_cohorttype_enum_old" AS ENUM('all_uncompleted', 'custom')`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ALTER COLUMN "cohortType" TYPE "public"."reminder_group_cohorttype_enum_old" USING "cohortType"::"text"::"public"."reminder_group_cohorttype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."reminder_group_cohorttype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."reminder_group_cohorttype_enum_old" RENAME TO "reminder_group_cohorttype_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."action_reminder_cohorttype_enum_old" AS ENUM('all_uncompleted', 'custom')`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "cohortType" TYPE "public"."action_reminder_cohorttype_enum_old" USING "cohortType"::"text"::"public"."action_reminder_cohorttype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."action_reminder_cohorttype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."action_reminder_cohorttype_enum_old" RENAME TO "action_reminder_cohorttype_enum"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP COLUMN "userGroupId"`);
    }

}
