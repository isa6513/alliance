import { MigrationInterface, QueryRunner } from "typeorm";

export class ForumAction1770313616164 implements MigrationInterface {
    name = 'ForumAction1770313616164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "isForumParticipationAction" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "isForumParticipationAction"`);
    }

}
