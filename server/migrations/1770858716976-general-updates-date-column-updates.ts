import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneralUpdatesDateColumnUpdates1770858716976 implements MigrationInterface {
    name = 'GeneralUpdatesDateColumnUpdates1770858716976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general_update" ALTER COLUMN "startDate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "general_update" ALTER COLUMN "endDate" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general_update" ALTER COLUMN "endDate" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "general_update" ALTER COLUMN "startDate" SET DEFAULT now()`);
    }

}
