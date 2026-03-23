import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReminderNotifPrefsRework1774304213298
  implements MigrationInterface
{
  name = 'ReminderNotifPrefsRework1774304213298';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename the enabled columns to the new ForActions names
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "emailNotifsEnabled" TO "emailNotifsForActions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "textNotifsEnabled" TO "textNotifsForActions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "pushNotifsEnabled" TO "pushNotifsForActions"`,
    );

    // Migrate data: only keep the preferred channel enabled, disable the rest.
    // This preserves existing behavior where only the preferred channel actually sent notifs.
    await queryRunner.query(`
            UPDATE "user"
            SET "emailNotifsForActions" = ("preferredActionReminderChannel" = 'email'),
                "textNotifsForActions"  = ("preferredActionReminderChannel" = 'text'),
                "pushNotifsForActions"  = ("preferredActionReminderChannel" = 'push')
        `);

    // Drop the now-unnecessary preferred channel column and its enum
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "preferredActionReminderChannel"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_preferredactionreminderchannel_enum"`,
    );

    // Drop the per-notif channel column and its enum
    await queryRunner.query(
      `ALTER TABLE "action_event_notif" DROP COLUMN "channel"`,
    );
    await queryRunner.query(`DROP TYPE "public"."NotificationChannel"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the NotificationChannel enum and action_event_notif.channel
    await queryRunner.query(
      `CREATE TYPE "public"."NotificationChannel" AS ENUM('text', 'email', 'push')`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_event_notif" ADD "channel" "public"."NotificationChannel" NOT NULL DEFAULT 'email'`,
    );

    // Recreate the preferredActionReminderChannel enum and column
    await queryRunner.query(
      `CREATE TYPE "public"."user_preferredactionreminderchannel_enum" AS ENUM('text', 'email', 'push')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "preferredActionReminderChannel" "public"."user_preferredactionreminderchannel_enum" NOT NULL DEFAULT 'text'`,
    );

    // Best-effort reverse: set preferred channel to whichever is currently enabled (priority: text > email > push)
    await queryRunner.query(`
            UPDATE "user"
            SET "preferredActionReminderChannel" = CASE
                WHEN "textNotifsForActions"  THEN 'text'
                WHEN "emailNotifsForActions" THEN 'email'
                WHEN "pushNotifsForActions"  THEN 'push'
                ELSE 'text'
            END
        `);

    // Rename columns back and set all to true (original granular enabled state is lost)
    await queryRunner.query(
      `UPDATE "user" SET "emailNotifsForActions" = true, "textNotifsForActions" = true, "pushNotifsForActions" = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "emailNotifsForActions" TO "emailNotifsEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "textNotifsForActions" TO "textNotifsEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "pushNotifsForActions" TO "pushNotifsEnabled"`,
    );
  }
}
