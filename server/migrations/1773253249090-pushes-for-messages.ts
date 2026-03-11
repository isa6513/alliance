import { MigrationInterface, QueryRunner } from "typeorm";

export class PushesForMessages1773253249090 implements MigrationInterface {
    name = 'PushesForMessages1773253249090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "pushesForMessages" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "pushesForMessages"`);
    }

}
