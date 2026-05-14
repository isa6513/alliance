import { MigrationInterface, QueryRunner } from 'typeorm';

export class DuplicateShareLinks1778783367329 implements MigrationInterface {
  name = 'DuplicateShareLinks1778783367329';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_share_url_user_action"`);
    await queryRunner.query(
      `DROP INDEX "public"."UQ_share_url_user_external_target"`,
    );
    await queryRunner.query(
      `ALTER TABLE "share_url" ADD "duplicate" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "share_url" ADD "label" text`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_share_url_user_external_target" ON "share_url" ("userId", "externalTargetId") WHERE "externalTargetId" IS NOT NULL AND "duplicate" = false`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_share_url_user_action" ON "share_url" ("userId", "actionId") WHERE "actionId" IS NOT NULL AND "duplicate" = false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_share_url_user_action"`);
    await queryRunner.query(
      `DROP INDEX "public"."UQ_share_url_user_external_target"`,
    );
    await queryRunner.query(`ALTER TABLE "share_url" DROP COLUMN "label"`);
    await queryRunner.query(`ALTER TABLE "share_url" DROP COLUMN "duplicate"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_share_url_user_external_target" ON "share_url" ("externalTargetId", "userId") WHERE ("externalTargetId" IS NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_share_url_user_action" ON "share_url" ("actionId", "userId") WHERE ("actionId" IS NOT NULL)`,
    );
  }
}
