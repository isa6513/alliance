import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationPushColumnTypes1774908870646
  implements MigrationInterface
{
  name = 'NotificationPushColumnTypes1774908870646';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "readAt" TYPE TIMESTAMP WITH TIME ZONE USING "readAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "pushClaimedBy" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "pushClaimedAt" TYPE TIMESTAMP WITH TIME ZONE USING "pushClaimedAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "unread_content" ALTER COLUMN "pushClaimedBy" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "unread_content" ALTER COLUMN "pushClaimedAt" TYPE TIMESTAMP WITH TIME ZONE USING "pushClaimedAt" AT TIME ZONE 'UTC'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "unread_content" ALTER COLUMN "pushClaimedAt" TYPE TIMESTAMP USING "pushClaimedAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "unread_content" ALTER COLUMN "pushClaimedBy" TYPE character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "pushClaimedAt" TYPE TIMESTAMP USING "pushClaimedAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "pushClaimedBy" TYPE character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "readAt" TYPE TIMESTAMP USING "readAt" AT TIME ZONE 'UTC'`,
    );
  }
}
