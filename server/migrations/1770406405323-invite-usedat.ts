import { MigrationInterface, QueryRunner } from "typeorm";

export class InviteUsedat1770406405323 implements MigrationInterface {
    name = 'InviteUsedat1770406405323'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onetime_invite" ADD "usedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onetime_invite" DROP COLUMN "usedAt"`);
    }

}
