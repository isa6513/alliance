import { MigrationInterface, QueryRunner } from "typeorm";

export class SidColumn1765476067577 implements MigrationInterface {
    name = 'SidColumn1765476067577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_share_url" ADD "sid" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_share_url" DROP COLUMN "sid"`);
    }

}
