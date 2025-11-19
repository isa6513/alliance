import { MigrationInterface, QueryRunner } from "typeorm";

export class NotifSendTime1763578621003 implements MigrationInterface {
    name = 'NotifSendTime1763578621003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ADD "sendTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "sendTime"`);
    }

}
