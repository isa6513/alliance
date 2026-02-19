import { MigrationInterface, QueryRunner } from "typeorm";

export class NoisyPosts1771536012819 implements MigrationInterface {
    name = 'NoisyPosts1771536012819'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "notifyForReplies" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "notifyForReplies"`);
    }

}
