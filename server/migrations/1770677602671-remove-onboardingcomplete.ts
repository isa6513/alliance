import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOnboardingcomplete1770677602671 implements MigrationInterface {
    name = 'RemoveOnboardingcomplete1770677602671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "onboardingComplete"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "onboardingComplete" boolean NOT NULL DEFAULT false`);
    }

}
