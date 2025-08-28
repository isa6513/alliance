import { MigrationInterface, QueryRunner } from "typeorm";

export class Commitmentless1756423286573 implements MigrationInterface {
    name = 'Commitmentless1756423286573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "commitmentless" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "commitmentless"`);
    }

}
