import { MigrationInterface, QueryRunner } from "typeorm";

export class Saveemailhtml1761353824723 implements MigrationInterface {
    name = 'Saveemailhtml1761353824723'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mail" ADD "renderedHtml" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mail" DROP COLUMN "renderedHtml"`);
    }

}
