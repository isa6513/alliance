import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostsVisibleAt1759863532414 implements MigrationInterface {
  name = 'PostsVisibleAt1759863532414';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post" ADD "visibleAt" TIMESTAMP`);

    await queryRunner.query(`UPDATE "post" SET "visibleAt" = "createdAt"`);

    await queryRunner.query(
      `ALTER TABLE "post" ALTER COLUMN "visibleAt" SET DEFAULT NOW()`,
    );
    await queryRunner.query(
      `ALTER TABLE "post" ALTER COLUMN "visibleAt" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "visibleAt"`);
  }
}
