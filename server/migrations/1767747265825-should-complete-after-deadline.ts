import { MigrationInterface, QueryRunner } from "typeorm";

export class ShouldCompleteAfterDeadline1767747265825 implements MigrationInterface {
    name = 'ShouldCompleteAfterDeadline1767747265825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "shouldCompleteAfterDeadline" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "shouldCompleteAfterDeadline"`);
    }

}
