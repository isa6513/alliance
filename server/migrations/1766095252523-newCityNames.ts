import { MigrationInterface, QueryRunner } from "typeorm";

export class NewCityNames1766095252523 implements MigrationInterface {
    name = 'NewCityNames1766095252523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "city" ADD "asciiName" character varying`);
        await queryRunner.query(`ALTER TABLE "city" ADD "englishName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "englishName"`);
        await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "asciiName"`);
    }

}
