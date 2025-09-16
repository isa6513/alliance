import { MigrationInterface, QueryRunner } from "typeorm";

export class Notiftype1758065543356 implements MigrationInterface {
    name = 'Notiftype1758065543356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ActionEventNotifType" AS ENUM('announcement', '3dayreminder', '1dayreminder')`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD "type" "public"."ActionEventNotifType" NOT NULL DEFAULT 'announcement'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."ActionEventNotifType"`);
    }

}
