import { MigrationInterface, QueryRunner } from "typeorm";

export class OnetimeInviteInfo1770246695706 implements MigrationInterface {
    name = 'OnetimeInviteInfo1770246695706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onetime_invite" ADD "info" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onetime_invite" DROP COLUMN "info"`);
    }

}
