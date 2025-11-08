import { MigrationInterface, QueryRunner } from "typeorm";

export class Flipordercheck1762556545562 implements MigrationInterface {
    name = 'Flipordercheck1762556545562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP CONSTRAINT "CHK_249fa5286ec5ee423a0cfdf987"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD CONSTRAINT "CHK_b81bb4192a6ae7d40a39c88a86" CHECK (relative_range_start_seconds_from_deadline IS NULL OR relative_range_end_seconds_from_deadline IS NULL OR relative_range_start_seconds_from_deadline >= relative_range_end_seconds_from_deadline)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP CONSTRAINT "CHK_b81bb4192a6ae7d40a39c88a86"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD CONSTRAINT "CHK_249fa5286ec5ee423a0cfdf987" CHECK (((relative_range_start_seconds_from_deadline IS NULL) OR (relative_range_end_seconds_from_deadline IS NULL) OR (relative_range_start_seconds_from_deadline <= relative_range_end_seconds_from_deadline)))`);
    }

}
