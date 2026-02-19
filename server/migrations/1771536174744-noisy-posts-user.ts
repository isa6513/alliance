import { MigrationInterface, QueryRunner } from "typeorm";

export class NoisyPostsUser1771536174744 implements MigrationInterface {
    name = 'NoisyPostsUser1771536174744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "receiveReplyNotifications" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "receiveReplyNotifications"`);
    }

}
