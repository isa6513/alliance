import { MigrationInterface, QueryRunner } from 'typeorm';

export class Commentattachments1757000000000 implements MigrationInterface {
  name = 'Commentattachments1757000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "attachments" jsonb NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "attachments"`,
    );
  }
}

