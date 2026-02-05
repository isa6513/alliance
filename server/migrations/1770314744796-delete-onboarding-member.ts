import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteOnboardingMember1770314744796 implements MigrationInterface {
    name = 'DeleteOnboardingMember1770314744796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isIntroductoryGroupMember"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isIntroductoryGroupMember" boolean NOT NULL DEFAULT true`);
    }

}
