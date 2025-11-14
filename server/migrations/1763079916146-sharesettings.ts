import { MigrationInterface, QueryRunner } from "typeorm";

export class Sharesettings1763079916146 implements MigrationInterface {
    name = 'Sharesettings1763079916146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "shareEmailWithCommunityLead" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "sharePhoneNumberWithCommunityLead" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "sharePhoneNumberWithCommunityLead"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "shareEmailWithCommunityLead"`);
    }

}
