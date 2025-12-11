import { MigrationInterface, QueryRunner } from "typeorm";

export class SidInResponse1765417613290 implements MigrationInterface {
    name = 'SidInResponse1765417613290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" ADD "sid" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" DROP COLUMN "sid"`);
    }

}
