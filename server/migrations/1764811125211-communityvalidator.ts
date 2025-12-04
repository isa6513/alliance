import { MigrationInterface, QueryRunner } from 'typeorm';

export class Communityvalidator1764811125211 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          UPDATE "custom_validator"
          SET "type" = 'MemberTag'
          WHERE "type" = 'MemberGroup';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          UPDATE "custom_validator"
          SET "type" = 'MemberGroup'
          WHERE "type" = 'MemberTag';
        `);
  }
}
