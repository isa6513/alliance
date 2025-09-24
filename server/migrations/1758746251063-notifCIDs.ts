import { MigrationInterface, QueryRunner } from "typeorm";

export class NotifCIDs1758746251063 implements MigrationInterface {
    name = 'NotifCIDs1758746251063'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mail" ADD "cid" character varying`);
        await queryRunner.query(`ALTER TABLE "mail" ADD "clickedLink" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "mms" ADD "cid" character varying`);
        await queryRunner.query(`ALTER TABLE "mms" ADD "clickedLink" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mms" DROP COLUMN "clickedLink"`);
        await queryRunner.query(`ALTER TABLE "mms" DROP COLUMN "cid"`);
        await queryRunner.query(`ALTER TABLE "mail" DROP COLUMN "clickedLink"`);
        await queryRunner.query(`ALTER TABLE "mail" DROP COLUMN "cid"`);
    }

}
