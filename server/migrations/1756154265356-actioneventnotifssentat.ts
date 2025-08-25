import { MigrationInterface, QueryRunner } from "typeorm";

export class Actioneventnotifssentat1756154265356 implements MigrationInterface {
    name = 'Actioneventnotifssentat1756154265356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event" ADD "notifsSentAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event" DROP COLUMN "notifsSentAt"`);
    }

}
