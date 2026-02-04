import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpressionValidator1770167050165 implements MigrationInterface {
    name = 'ExpressionValidator1770167050165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_validator" ADD "expression" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_validator" DROP COLUMN "expression"`);
    }

}
