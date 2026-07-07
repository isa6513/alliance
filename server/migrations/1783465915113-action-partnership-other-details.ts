import { MigrationInterface, QueryRunner } from "typeorm";

export class ActionPartnershipOtherDetails1783465915113 implements MigrationInterface {
    name = 'ActionPartnershipOtherDetails1783465915113'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_partnership_response" ADD "outreachOtherDetails" text NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_partnership_response" DROP COLUMN "outreachOtherDetails"`);
    }

}
