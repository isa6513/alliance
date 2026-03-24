import { MigrationInterface, QueryRunner } from "typeorm";

export class FollowUpFormCohortExpression1774393404142 implements MigrationInterface {
    name = 'FollowUpFormCohortExpression1774393404142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "follow_up_form" ADD "cohortExpression" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "follow_up_form" DROP COLUMN "cohortExpression"`);
    }

}
