import { MigrationInterface, QueryRunner } from 'typeorm';

export class Deadlinenotifssentat1760379812689 implements MigrationInterface {
  name = 'Deadlinenotifssentat1760379812689';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_event" ADD "deadlineNotifsSentAt" TIMESTAMP WITH TIME ZONE`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."ActionEventNotifType" RENAME TO "ActionEventNotifType_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ActionEventNotifType" AS ENUM ('announcement','3dayreminder','1dayreminder','misseddeadline')`,
    );

    await queryRunner.query(
      `ALTER TABLE "action_event_notif" ALTER COLUMN "type" DROP DEFAULT`,
    );

    await queryRunner.query(`
            ALTER TABLE "action_event_notif"
            ALTER COLUMN "type" TYPE "public"."ActionEventNotifType"
            USING (
              CASE "type"::text
                WHEN 'missedseconddeadline' THEN 'misseddeadline'
                ELSE "type"::text
              END
            )::"public"."ActionEventNotifType"
          `);

    await queryRunner.query(
      `ALTER TABLE "action_event_notif" ALTER COLUMN "type" SET DEFAULT 'announcement'`,
    );

    await queryRunner.query(`DROP TYPE "public"."ActionEventNotifType_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."ActionEventNotifType_old" AS ENUM('announcement', '3dayreminder', '1dayreminder', 'misseddeadline', 'missedseconddeadline')`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_event_notif" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_event_notif" ALTER COLUMN "type" TYPE "public"."ActionEventNotifType_old" USING "type"::"text"::"public"."ActionEventNotifType_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_event_notif" ALTER COLUMN "type" SET DEFAULT 'announcement'`,
    );
    await queryRunner.query(`DROP TYPE "public"."ActionEventNotifType"`);
    await queryRunner.query(
      `ALTER TYPE "public"."ActionEventNotifType_old" RENAME TO "ActionEventNotifType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_event" DROP COLUMN "deadlineNotifsSentAt"`,
    );
  }
}
