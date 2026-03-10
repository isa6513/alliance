import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnreadcontentReadTracking1773169000000
  implements MigrationInterface
{
  name = 'UnreadcontentReadTracking1773169000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "unread_content" ADD "sendTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "unread_content" ADD "readAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `UPDATE "unread_content" SET "sendTime" = "createdAt"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_unread_content_user_type_content" ON "unread_content" ("userId", "contentType", "contentId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_unread_content_user_type_content"`,
    );
    await queryRunner.query(`ALTER TABLE "unread_content" DROP COLUMN "readAt"`);
    await queryRunner.query(
      `ALTER TABLE "unread_content" DROP COLUMN "sendTime"`,
    );
  }
}
