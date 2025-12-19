import { MigrationInterface, QueryRunner } from "typeorm";

export class SessionReplayUrl1766173540865 implements MigrationInterface {
    name = 'SessionReplayUrl1766173540865'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" ADD "sessionReplayUrl" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" DROP COLUMN "sessionReplayUrl"`);
    }

}
