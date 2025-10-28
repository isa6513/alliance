import { MigrationInterface, QueryRunner } from "typeorm";

export class Remindergroups1761594699882 implements MigrationInterface {
    name = 'Remindergroups1761594699882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reminder_group" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "allSent" boolean NOT NULL DEFAULT false, "emailMessage" text NOT NULL, "emailSubject" text NOT NULL, "textMessage" text NOT NULL, "actionEventId" integer, CONSTRAINT "PK_e25ad93cc4910091a6598e42945" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ADD "groupId" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "preferredReminderTime" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "timeZone" integer`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "emailMessage" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "emailSubject" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "textMessage" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD CONSTRAINT "FK_3b857834886ade769b6bee38ee6" FOREIGN KEY ("actionEventId") REFERENCES "action_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ADD CONSTRAINT "FK_0f0123911efc206d9d99818e475" FOREIGN KEY ("groupId") REFERENCES "reminder_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_reminder" DROP CONSTRAINT "FK_0f0123911efc206d9d99818e475"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP CONSTRAINT "FK_3b857834886ade769b6bee38ee6"`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "textMessage" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "emailSubject" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "emailMessage" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "timeZone"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "preferredReminderTime"`);
        await queryRunner.query(`ALTER TABLE "action_reminder" DROP COLUMN "groupId"`);
        await queryRunner.query(`DROP TABLE "reminder_group"`);
    }

}
