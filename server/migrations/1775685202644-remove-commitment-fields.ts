import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCommitmentFields1775685202644 implements MigrationInterface {
    name = 'RemoveCommitmentFields1775685202644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "commitmentThreshold"`);
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "commitmentless"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6e446b5ec2f5b912fb6bfa1426"`);
        await queryRunner.query(`ALTER TYPE "public"."action_event_newstatus_enum" RENAME TO "action_event_newstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."action_event_newstatus_enum" AS ENUM('draft', 'planned', 'office_action', 'member_action', 'resolution', 'completed', 'failed', 'abandoned')`);
        await queryRunner.query(`ALTER TABLE "action_event" ALTER COLUMN "newStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "action_event" ALTER COLUMN "newStatus" TYPE "public"."action_event_newstatus_enum" USING "newStatus"::"text"::"public"."action_event_newstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "action_event" ALTER COLUMN "newStatus" SET DEFAULT 'draft'`);
        await queryRunner.query(`DROP TYPE "public"."action_event_newstatus_enum_old"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_action_activity_type_createdAt"`);
        await queryRunner.query(`ALTER TYPE "public"."action_activity_type_enum" RENAME TO "action_activity_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."action_activity_type_enum" AS ENUM('user_completed', 'user_wont_complete', 'user_dismissed', 'user_submitted_follow_up_form')`);
        await queryRunner.query(`ALTER TABLE "action_activity" ALTER COLUMN "type" TYPE "public"."action_activity_type_enum" USING "type"::"text"::"public"."action_activity_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."action_activity_type_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_6e446b5ec2f5b912fb6bfa1426" ON "action_event" ("actionId", "newStatus", "date") `);
        await queryRunner.query(`CREATE INDEX "IDX_action_activity_type_createdAt" ON "action_activity" ("type", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_action_activity_type_createdAt"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6e446b5ec2f5b912fb6bfa1426"`);
        await queryRunner.query(`CREATE TYPE "public"."action_activity_type_enum_old" AS ENUM('user_joined', 'user_completed', 'user_declined', 'user_wont_complete', 'user_dismissed', 'user_submitted_follow_up_form')`);
        await queryRunner.query(`ALTER TABLE "action_activity" ALTER COLUMN "type" TYPE "public"."action_activity_type_enum_old" USING "type"::"text"::"public"."action_activity_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."action_activity_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."action_activity_type_enum_old" RENAME TO "action_activity_type_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_action_activity_type_createdAt" ON "action_activity" ("createdAt", "type") `);
        await queryRunner.query(`CREATE TYPE "public"."action_event_newstatus_enum_old" AS ENUM('draft', 'planned', 'gathering_commitments', 'office_action', 'member_action', 'resolution', 'completed', 'failed', 'abandoned')`);
        await queryRunner.query(`ALTER TABLE "action_event" ALTER COLUMN "newStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "action_event" ALTER COLUMN "newStatus" TYPE "public"."action_event_newstatus_enum_old" USING "newStatus"::"text"::"public"."action_event_newstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "action_event" ALTER COLUMN "newStatus" SET DEFAULT 'draft'`);
        await queryRunner.query(`DROP TYPE "public"."action_event_newstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."action_event_newstatus_enum_old" RENAME TO "action_event_newstatus_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_6e446b5ec2f5b912fb6bfa1426" ON "action_event" ("actionId", "date", "newStatus") `);
        await queryRunner.query(`ALTER TABLE "action" ADD "commitmentless" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "action" ADD "commitmentThreshold" integer`);
    }

}
