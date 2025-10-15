import { MigrationInterface, QueryRunner } from "typeorm";

export class Customreminders1760558269321 implements MigrationInterface {
    name = 'Customreminders1760558269321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "action_reminder" ("id" SERIAL NOT NULL, "customEmailMessage" text, "customTextMessage" text, "sendAt" TIMESTAMP NOT NULL, "sentAt" TIMESTAMP, "memberActionEventId" integer, "deadlineEventId" integer, CONSTRAINT "PK_87cdd2517d1756d61f03d2cacde" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "action_reminder_users_user" ("actionReminderId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_1a5c8ed8aff6278b38f4adcbdd9" PRIMARY KEY ("actionReminderId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6fea3fc4e962f850616f1ce32a" ON "action_reminder_users_user" ("actionReminderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9d78b27171039a9e0832ccdda4" ON "action_reminder_users_user" ("userId") `);
        await queryRunner.query(`ALTER TYPE "public"."EmailType" RENAME TO "EmailType_old"`);
        await queryRunner.query(`CREATE TYPE "public"."EmailType" AS ENUM('verification', 'password_reset', 'partial_signup', 'welcome', 'other', 'commitment', 'memberaction', 'commitmentreminder', 'memberactionreminder', 'forum_digest', 'missed_deadline', 'missed_second_deadline', 'custom_action_reminder')`);
        await queryRunner.query(`ALTER TABLE "mail" ALTER COLUMN "emailType" TYPE "public"."EmailType" USING "emailType"::"text"::"public"."EmailType"`);
        await queryRunner.query(`DROP TYPE "public"."EmailType_old"`);
        await queryRunner.query(`ALTER TYPE "public"."ActionEventNotifType" RENAME TO "ActionEventNotifType_old"`);
        await queryRunner.query(`CREATE TYPE "public"."ActionEventNotifType" AS ENUM('announcement', '3dayreminder', '1dayreminder', 'misseddeadline', 'customreminder')`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" TYPE "public"."ActionEventNotifType" USING "type"::"text"::"public"."ActionEventNotifType"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" SET DEFAULT 'announcement'`);
        await queryRunner.query(`DROP TYPE "public"."ActionEventNotifType_old"`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ADD CONSTRAINT "FK_70e92c769bcd8fd2314dd6d960b" FOREIGN KEY ("memberActionEventId") REFERENCES "action_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_reminder" ADD CONSTRAINT "FK_4ee0d898ad963a8ad5c10d2c5f4" FOREIGN KEY ("deadlineEventId") REFERENCES "action_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_reminder_users_user" ADD CONSTRAINT "FK_6fea3fc4e962f850616f1ce32a5" FOREIGN KEY ("actionReminderId") REFERENCES "action_reminder"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "action_reminder_users_user" ADD CONSTRAINT "FK_9d78b27171039a9e0832ccdda40" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_reminder_users_user" DROP CONSTRAINT "FK_9d78b27171039a9e0832ccdda40"`);
        await queryRunner.query(`ALTER TABLE "action_reminder_users_user" DROP CONSTRAINT "FK_6fea3fc4e962f850616f1ce32a5"`);
        await queryRunner.query(`ALTER TABLE "action_reminder" DROP CONSTRAINT "FK_4ee0d898ad963a8ad5c10d2c5f4"`);
        await queryRunner.query(`ALTER TABLE "action_reminder" DROP CONSTRAINT "FK_70e92c769bcd8fd2314dd6d960b"`);
        await queryRunner.query(`CREATE TYPE "public"."ActionEventNotifType_old" AS ENUM('announcement', '3dayreminder', '1dayreminder', 'misseddeadline')`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" TYPE "public"."ActionEventNotifType_old" USING "type"::"text"::"public"."ActionEventNotifType_old"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" SET DEFAULT 'announcement'`);
        await queryRunner.query(`DROP TYPE "public"."ActionEventNotifType"`);
        await queryRunner.query(`ALTER TYPE "public"."ActionEventNotifType_old" RENAME TO "ActionEventNotifType"`);
        await queryRunner.query(`CREATE TYPE "public"."EmailType_old" AS ENUM('verification', 'password_reset', 'partial_signup', 'welcome', 'other', 'commitment', 'memberaction', 'commitmentreminder', 'memberactionreminder', 'forum_digest', 'missed_deadline', 'missed_second_deadline')`);
        await queryRunner.query(`ALTER TABLE "mail" ALTER COLUMN "emailType" TYPE "public"."EmailType_old" USING "emailType"::"text"::"public"."EmailType_old"`);
        await queryRunner.query(`DROP TYPE "public"."EmailType"`);
        await queryRunner.query(`ALTER TYPE "public"."EmailType_old" RENAME TO "EmailType"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9d78b27171039a9e0832ccdda4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6fea3fc4e962f850616f1ce32a"`);
        await queryRunner.query(`DROP TABLE "action_reminder_users_user"`);
        await queryRunner.query(`DROP TABLE "action_reminder"`);
    }

}
