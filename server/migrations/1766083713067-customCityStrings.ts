import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomCityStrings1766083713067 implements MigrationInterface {
    name = 'CustomCityStrings1766083713067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "customCityString" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "customCityString"`);
    }

}
