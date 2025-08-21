import { MigrationInterface, QueryRunner } from "typeorm";

export class Pinnedpost1755735754417 implements MigrationInterface {
    name = 'Pinnedpost1755735754417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "pinned" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "pinned"`);
    }

}
