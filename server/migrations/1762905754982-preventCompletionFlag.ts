import { MigrationInterface, QueryRunner } from "typeorm";

export class PreventCompletionFlag1762905754982 implements MigrationInterface {
    name = 'PreventCompletionFlag1762905754982'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "preventCompletion" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "preventCompletion"`);
    }

}
