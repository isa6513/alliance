import { MigrationInterface, QueryRunner } from "typeorm";

export class PostShowClusterTags1779153270716 implements MigrationInterface {
    name = 'PostShowClusterTags1779153270716'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "showClusterTags" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "showClusterTags"`);
    }

}
