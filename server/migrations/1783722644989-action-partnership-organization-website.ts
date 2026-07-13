import { MigrationInterface, QueryRunner } from "typeorm";

export class ActionPartnershipOrganizationWebsite1783722644989 implements MigrationInterface {
    name = 'ActionPartnershipOrganizationWebsite1783722644989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_partnership_response" ADD "organizationWebsite" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_partnership_response" DROP COLUMN "organizationWebsite"`);
    }

}
