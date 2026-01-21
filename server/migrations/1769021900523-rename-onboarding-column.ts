import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameOnboardingColumn1769021900523 implements MigrationInterface {
    name = 'RenameOnboardingColumn1769021900523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "inOnboardingPhase" TO "isIntroductoryGroupMember"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "isIntroductoryGroupMember" TO "inOnboardingPhase"`);
    }

}
