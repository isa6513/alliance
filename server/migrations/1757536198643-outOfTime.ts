import { MigrationInterface, QueryRunner } from "typeorm";

export class OutOfTime1757536198643 implements MigrationInterface {
    name = 'OutOfTime1757536198643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_activity" ADD "outOfTime" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_activity" DROP COLUMN "outOfTime"`);
    }

}
