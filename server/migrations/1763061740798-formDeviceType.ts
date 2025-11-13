import { MigrationInterface, QueryRunner } from 'typeorm';

export class FormDeviceType1763061740798 implements MigrationInterface {
  name = 'FormDeviceType1763061740798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_response" ADD "deviceType" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "likesCount" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "likesCount"`);
    await queryRunner.query(
      `ALTER TABLE "form_response" DROP COLUMN "deviceType"`,
    );
  }
}
