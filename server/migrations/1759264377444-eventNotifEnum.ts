import { MigrationInterface, QueryRunner } from "typeorm";

export class EventNotifEnum1759264377444 implements MigrationInterface {
    name = 'EventNotifEnum1759264377444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."ActionEventNotifType" RENAME TO "ActionEventNotifType_old"`);
        await queryRunner.query(`CREATE TYPE "public"."ActionEventNotifType" AS ENUM('announcement', '3dayreminder', '1dayreminder', 'misseddeadline', 'missedseconddeadline')`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" TYPE "public"."ActionEventNotifType" USING "type"::"text"::"public"."ActionEventNotifType"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" SET DEFAULT 'announcement'`);
        await queryRunner.query(`DROP TYPE "public"."ActionEventNotifType_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ActionEventNotifType_old" AS ENUM('announcement', '3dayreminder', '1dayreminder')`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" TYPE "public"."ActionEventNotifType_old" USING "type"::"text"::"public"."ActionEventNotifType_old"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" SET DEFAULT 'announcement'`);
        await queryRunner.query(`DROP TYPE "public"."ActionEventNotifType"`);
        await queryRunner.query(`ALTER TYPE "public"."ActionEventNotifType_old" RENAME TO "ActionEventNotifType"`);
    }

}
