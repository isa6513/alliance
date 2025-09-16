import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReminderNotifs1758061051025 implements MigrationInterface {
  name = 'ReminderNotifs1758061051025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_event" RENAME COLUMN "notifsSentAt" TO "announcementNotifsSentAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_event" ADD "threeDayReminderNotifsSentAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_event" ADD "oneDayReminderNotifsSentAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_event" DROP COLUMN "oneDayReminderNotifsSentAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_event" DROP COLUMN "threeDayReminderNotifsSentAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_event" RENAME COLUMN "announcementNotifsSentAt" TO "notifsSentAt"`,
    );
  }
}
