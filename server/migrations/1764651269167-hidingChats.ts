import { MigrationInterface, QueryRunner } from "typeorm";

export class HidingChats1764651269167 implements MigrationInterface {
    name = 'HidingChats1764651269167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participant" ADD "userHidden" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participant" DROP COLUMN "userHidden"`);
    }

}
