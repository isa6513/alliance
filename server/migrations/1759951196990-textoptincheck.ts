import { MigrationInterface, QueryRunner } from "typeorm";

export class Textoptincheck1759951196990 implements MigrationInterface {
    name = 'Textoptincheck1759951196990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "sentTextOptInMessageAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "sentTextOptInMessageAt"`);
    }

}
