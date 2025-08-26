import { MigrationInterface, QueryRunner } from 'typeorm';

export class NumericalTimeEstimate1756250558456 implements MigrationInterface {
  name = 'NumericalTimeEstimate1756250558456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "timeEstimate"`);
    await queryRunner.query(`ALTER TABLE "action" ADD "timeEstimate" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "timeEstimate"`);
    await queryRunner.query(
      `ALTER TABLE "action" ADD "timeEstimate" character varying`,
    );
  }
}
