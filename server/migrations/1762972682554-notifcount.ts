import { MigrationInterface, QueryRunner } from "typeorm";

export class Notifcount1762972682554 implements MigrationInterface {
    name = 'Notifcount1762972682554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ADD "groupingCount" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "groupingCount"`);
    }

}
