import { MigrationInterface, QueryRunner } from "typeorm";

export class Personalreminders1761605196689 implements MigrationInterface {
    name = 'Personalreminders1761605196689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_reminder" DROP CONSTRAINT "FK_0f0123911efc206d9d99818e475"`);
        await queryRunner.query(`CREATE TABLE "personal_action_reminder" ("id" SERIAL NOT NULL, "sentAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "memberActionEventId" integer, "userId" integer, "groupId" integer, CONSTRAINT "PK_6d4846ed4254ec57d30429078d8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "action_reminder" DROP COLUMN "groupId"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD "sendDay" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "emailMessage" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "emailSubject" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "textMessage" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "preferredReminderTime"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "preferredReminderTime" TIME`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "timeZone"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "timeZone" text`);
        await queryRunner.query(`ALTER TABLE "personal_action_reminder" ADD CONSTRAINT "FK_e819434446cf699c7e8c95d3ac7" FOREIGN KEY ("memberActionEventId") REFERENCES "action_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "personal_action_reminder" ADD CONSTRAINT "FK_6f2a4dc2bfd7df8630a2251756b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "personal_action_reminder" ADD CONSTRAINT "FK_eb9ab174d0c4d33a14fc4f7dfa8" FOREIGN KEY ("groupId") REFERENCES "reminder_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personal_action_reminder" DROP CONSTRAINT "FK_eb9ab174d0c4d33a14fc4f7dfa8"`);
        await queryRunner.query(`ALTER TABLE "personal_action_reminder" DROP CONSTRAINT "FK_6f2a4dc2bfd7df8630a2251756b"`);
        await queryRunner.query(`ALTER TABLE "personal_action_reminder" DROP CONSTRAINT "FK_e819434446cf699c7e8c95d3ac7"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "timeZone"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "timeZone" integer`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "preferredReminderTime"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "preferredReminderTime" character varying`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "textMessage" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "emailSubject" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ALTER COLUMN "emailMessage" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP COLUMN "sendDay"`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ADD "groupId" integer`);
        await queryRunner.query(`DROP TABLE "personal_action_reminder"`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ADD CONSTRAINT "FK_0f0123911efc206d9d99818e475" FOREIGN KEY ("groupId") REFERENCES "reminder_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
