import { MigrationInterface, QueryRunner } from "typeorm";

export class NotifsCid1771541586116 implements MigrationInterface {
    name = 'NotifsCid1771541586116'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ADD "cid" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "cid"`);
    }

}
