import { MigrationInterface, QueryRunner } from "typeorm";

export class MessagePushNotifs1773200000000 implements MigrationInterface {
    name = 'MessagePushNotifs1773200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "pushesForMessages" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "pushesForMessages"`);
    }

}
