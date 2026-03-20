import { MigrationInterface, QueryRunner } from 'typeorm';

export class FriendRequestAcceptedWebappLocation1774032781000
  implements MigrationInterface
{
  name = 'FriendRequestAcceptedWebappLocation1774032781000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification" n
      SET "webAppLocation" = '/member/' || nau."userId"
      FROM "notification_associated_users" nau
      WHERE n."category" = 'friend_request_accepted'
        AND nau."notificationId" = n."id";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot reliably revert — old webAppLocation values are unknown
  }
}
