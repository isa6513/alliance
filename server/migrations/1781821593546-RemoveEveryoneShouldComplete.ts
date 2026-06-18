import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveEveryoneShouldComplete1781821593546 implements MigrationInterface {
    name = 'RemoveEveryoneShouldComplete1781821593546'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "everyoneShouldComplete"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "everyoneShouldComplete" boolean NOT NULL DEFAULT false`);
    }

}
