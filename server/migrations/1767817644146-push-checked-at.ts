import { MigrationInterface, QueryRunner } from "typeorm";

export class PushCheckedAt1767817644146 implements MigrationInterface {
    name = 'PushCheckedAt1767817644146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push" ADD "lastCheckedStatusAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push" DROP COLUMN "lastCheckedStatusAt"`);
    }

}
