import { MigrationInterface, QueryRunner } from "typeorm";

export class Showtononparticipatingflag1758906659289 implements MigrationInterface {
    name = 'Showtononparticipatingflag1758906659289'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "showToNonparticipating" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "showToNonparticipating"`);
    }

}
