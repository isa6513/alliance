import { MigrationInterface, QueryRunner } from "typeorm";

export class Tt1768505807207 implements MigrationInterface {
    name = 'Tt1768505807207'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_validator" DROP COLUMN "idArgument"`);
        await queryRunner.query(`ALTER TABLE "custom_validator" ADD "idArgument" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_validator" DROP COLUMN "idArgument"`);
        await queryRunner.query(`ALTER TABLE "custom_validator" ADD "idArgument" integer`);
    }

}
