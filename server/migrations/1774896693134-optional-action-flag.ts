import { MigrationInterface, QueryRunner } from "typeorm";

export class OptionalActionFlag1774896693134 implements MigrationInterface {
    name = 'OptionalActionFlag1774896693134'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD "excludeOptionalActions" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP COLUMN "excludeOptionalActions"`);
    }

}
