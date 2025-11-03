import { MigrationInterface, QueryRunner } from 'typeorm';

export class Cachedvisiblility1762198697178 implements MigrationInterface {
  name = 'Cachedvisiblility1762198697178';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_response" ADD "visibilityValidatorResults" jsonb NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_response" DROP COLUMN "visibilityValidatorResults"`,
    );
  }
}
