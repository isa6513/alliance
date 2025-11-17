import { MigrationInterface, QueryRunner } from "typeorm";

export class SuiteTaskCountFlag1763408742060 implements MigrationInterface {
    name = 'SuiteTaskCountFlag1763408742060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD "useSuiteTaskCount" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP COLUMN "useSuiteTaskCount"`);
    }

}
