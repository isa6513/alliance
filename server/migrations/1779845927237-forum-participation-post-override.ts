import { MigrationInterface, QueryRunner } from "typeorm";

export class ForumParticipationPostOverride1779845927237 implements MigrationInterface {
    name = 'ForumParticipationPostOverride1779845927237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "forumParticipationPostId" integer`);
        await queryRunner.query(`ALTER TABLE "action" ADD "forumParticipationIncludeChildren" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "forumParticipationIncludeChildren"`);
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "forumParticipationPostId"`);
    }

}
