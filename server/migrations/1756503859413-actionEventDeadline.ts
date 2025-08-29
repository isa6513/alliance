import { MigrationInterface, QueryRunner } from "typeorm";

export class ActionEventDeadline1756503859413 implements MigrationInterface {
    name = 'ActionEventDeadline1756503859413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event" ADD "deadline" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event" DROP COLUMN "deadline"`);
    }

}
