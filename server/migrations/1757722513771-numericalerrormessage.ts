import { MigrationInterface, QueryRunner } from 'typeorm';

export class Numericalerrormessage1757722513771 implements MigrationInterface {
  name = 'Numericalerrormessage1757722513771';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "mms" DROP COLUMN "errorCode"`);
    await queryRunner.query(`ALTER TABLE "mms" ADD "errorCode" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "mms" DROP COLUMN "errorCode"`);
    await queryRunner.query(
      `ALTER TABLE "mms" ADD "errorCode" character varying`,
    );
  }
}
