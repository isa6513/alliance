import { MigrationInterface, QueryRunner } from "typeorm";

export class Includelinkoption1760562989548 implements MigrationInterface {
    name = 'Includelinkoption1760562989548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_reminder" ADD "includeActionLinkInMessages" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_reminder" DROP COLUMN "includeActionLinkInMessages"`);
    }

}
