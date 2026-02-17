import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneralUpdatePriority1771369237972 implements MigrationInterface {
    name = 'GeneralUpdatePriority1771369237972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general_update" ADD "priority" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general_update" DROP COLUMN "priority"`);
    }

}
