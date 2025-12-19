import { MigrationInterface, QueryRunner } from "typeorm";

export class PhFormId1766170657666 implements MigrationInterface {
    name = 'PhFormId1766170657666'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" ADD "phDistinctId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" DROP COLUMN "phDistinctId"`);
    }

}
