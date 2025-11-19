import { MigrationInterface, QueryRunner } from "typeorm";

export class NoShowInTimeline1763574654994 implements MigrationInterface {
    name = 'NoShowInTimeline1763574654994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event" DROP COLUMN "showInTimeline"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event" ADD "showInTimeline" boolean NOT NULL DEFAULT false`);
    }

}
