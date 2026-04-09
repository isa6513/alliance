import { MigrationInterface, QueryRunner } from "typeorm";

export class PushesForActionUpdates1775757128434 implements MigrationInterface {
    name = 'PushesForActionUpdates1775757128434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "pushesForActionUpdates" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "pushesForActionUpdates"`);
    }

}
