import { MigrationInterface, QueryRunner } from "typeorm";

export class Nodeadlines1758048211310 implements MigrationInterface {
    name = 'Nodeadlines1758048211310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event" DROP COLUMN "deadline"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event" ADD "deadline" TIMESTAMP`);
    }

}
