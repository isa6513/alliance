import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContractDateSigned1757271542280 implements MigrationInterface {
  name = 'ContractDateSigned1757271542280';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "contractDateSigned" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "contractDateSigned"`,
    );
  }
}
