import { MigrationInterface, QueryRunner } from "typeorm";

export class Relativeranges1762555212639 implements MigrationInterface {
    name = 'Relativeranges1762555212639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP CONSTRAINT "CHK_7c15e87a365e5968509fed8385"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD "relative_range_start_seconds_from_deadline" integer`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD "relative_range_end_seconds_from_deadline" integer`);
        await queryRunner.query(`ALTER TYPE "public"."reminder_group_timingmode_enum" RENAME TO "reminder_group_timingmode_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."reminder_group_timingmode_enum" AS ENUM('absolute', 'from_deadline', 'within_range', 'within_relative_range', 'event_launch')`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ALTER COLUMN "timingMode" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ALTER COLUMN "timingMode" TYPE "public"."reminder_group_timingmode_enum" USING "timingMode"::"text"::"public"."reminder_group_timingmode_enum"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ALTER COLUMN "timingMode" SET DEFAULT 'within_range'`);
        await queryRunner.query(`DROP TYPE "public"."reminder_group_timingmode_enum_old"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD CONSTRAINT "CHK_249fa5286ec5ee423a0cfdf987" CHECK (relative_range_start_seconds_from_deadline IS NULL OR relative_range_end_seconds_from_deadline IS NULL OR relative_range_start_seconds_from_deadline <= relative_range_end_seconds_from_deadline)`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD CONSTRAINT "CHK_a0d02d5c399e70d5fbd9cabeed" CHECK (("timingMode" = 'absolute' AND "sendAtAbsolute" IS NOT NULL)
     OR ("timingMode" = 'from_deadline' AND "sendAtSecondsFromDeadline" IS NOT NULL)
     OR ("timingMode" = 'within_range' AND "send_range_start" IS NOT NULL AND "send_range_end" IS NOT NULL)
     OR ("timingMode" = 'within_relative_range' AND "relative_range_start_seconds_from_deadline" IS NOT NULL AND "relative_range_end_seconds_from_deadline" IS NOT NULL)
     OR ("timingMode" = 'event_launch' AND "memberActionEventId" IS NOT NULL))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP CONSTRAINT "CHK_a0d02d5c399e70d5fbd9cabeed"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP CONSTRAINT "CHK_249fa5286ec5ee423a0cfdf987"`);
        await queryRunner.query(`CREATE TYPE "public"."reminder_group_timingmode_enum_old" AS ENUM('absolute', 'from_deadline', 'within_range', 'event_launch')`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ALTER COLUMN "timingMode" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ALTER COLUMN "timingMode" TYPE "public"."reminder_group_timingmode_enum_old" USING "timingMode"::"text"::"public"."reminder_group_timingmode_enum_old"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ALTER COLUMN "timingMode" SET DEFAULT 'within_range'`);
        await queryRunner.query(`DROP TYPE "public"."reminder_group_timingmode_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."reminder_group_timingmode_enum_old" RENAME TO "reminder_group_timingmode_enum"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP COLUMN "relative_range_end_seconds_from_deadline"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP COLUMN "relative_range_start_seconds_from_deadline"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD CONSTRAINT "CHK_7c15e87a365e5968509fed8385" CHECK (((("timingMode" = 'absolute'::reminder_group_timingmode_enum) AND ("sendAtAbsolute" IS NOT NULL)) OR (("timingMode" = 'from_deadline'::reminder_group_timingmode_enum) AND ("sendAtSecondsFromDeadline" IS NOT NULL)) OR (("timingMode" = 'within_range'::reminder_group_timingmode_enum) AND (send_range_start IS NOT NULL) AND (send_range_end IS NOT NULL)) OR (("timingMode" = 'event_launch'::reminder_group_timingmode_enum) AND ("memberActionEventId" IS NOT NULL))))`);
    }

}
