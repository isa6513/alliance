import { MigrationInterface, QueryRunner } from "typeorm";

export class DeviceUniqueOnPushtoken1773700418340 implements MigrationInterface {
    name = 'DeviceUniqueOnPushtoken1773700418340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_device" ADD CONSTRAINT "UQ_f7d5749a78e508db745facb2c3d" UNIQUE ("expoPushToken")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_device" DROP CONSTRAINT "UQ_f7d5749a78e508db745facb2c3d"`);
    }

}
