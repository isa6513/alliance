import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStaffCol1756337175565 implements MigrationInterface {
    name = 'AddStaffCol1756337175565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "donationThreshold"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "staff" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "staff"`);
        await queryRunner.query(`ALTER TABLE "action" ADD "donationThreshold" integer`);
    }

}
