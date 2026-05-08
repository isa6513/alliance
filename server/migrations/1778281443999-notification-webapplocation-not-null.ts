import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationWebapplocationNotNull1778281443999 implements MigrationInterface {
    name = 'NotificationWebapplocationNotNull1778281443999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "webAppLocation" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "webAppLocation" DROP NOT NULL`);
    }

}
