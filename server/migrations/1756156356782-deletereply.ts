import { MigrationInterface, QueryRunner } from 'typeorm';

export class Deletereply1756156356782 implements MigrationInterface {
  name = 'Deletereply1756156356782';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reply"`);
  }

  public async down(): Promise<void> {}
}
