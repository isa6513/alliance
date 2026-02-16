import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneralUpdatesOptionalDates1771267551867 implements MigrationInterface {
    name = 'GeneralUpdatesOptionalDates1771267551867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general_update" ALTER COLUMN "startDate" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "general_update" ALTER COLUMN "endDate" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general_update" ALTER COLUMN "endDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "general_update" ALTER COLUMN "startDate" SET NOT NULL`);
    }

}
