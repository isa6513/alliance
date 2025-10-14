import { MigrationInterface, QueryRunner } from "typeorm";

export class Archiveactions1760477186244 implements MigrationInterface {
    name = 'Archiveactions1760477186244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "archived" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "archived"`);
    }

}
