import { MigrationInterface, QueryRunner } from "typeorm";

export class Everyonecompleteflag1760390419519 implements MigrationInterface {
    name = 'Everyonecompleteflag1760390419519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "everyoneShouldComplete" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "everyoneShouldComplete"`);
    }

}
