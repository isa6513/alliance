import { MigrationInterface, QueryRunner } from "typeorm";

export class Publicanswers1763515495174 implements MigrationInterface {
    name = 'Publicanswers1763515495174'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" ADD "publicAnswers" jsonb NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" DROP COLUMN "publicAnswers"`);
    }

}
