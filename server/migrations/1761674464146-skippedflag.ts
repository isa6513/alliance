import { MigrationInterface, QueryRunner } from "typeorm";

export class Skippedflag1761674464146 implements MigrationInterface {
    name = 'Skippedflag1761674464146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personal_action_reminder" ADD "skippedForCompletion" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personal_action_reminder" DROP COLUMN "skippedForCompletion"`);
    }

}
