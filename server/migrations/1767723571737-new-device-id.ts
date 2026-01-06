import { MigrationInterface, QueryRunner } from "typeorm";

export class NewDeviceId1767723571737 implements MigrationInterface {
    name = 'NewDeviceId1767723571737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_device" DROP CONSTRAINT "PK_0232591a0b48e1eb92f3ec5d0d1"`);
        await queryRunner.query(`ALTER TABLE "user_device" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_device" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "user_device" ADD CONSTRAINT "PK_0232591a0b48e1eb92f3ec5d0d1" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_device" DROP CONSTRAINT "PK_0232591a0b48e1eb92f3ec5d0d1"`);
        await queryRunner.query(`ALTER TABLE "user_device" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_device" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_device" ADD CONSTRAINT "PK_0232591a0b48e1eb92f3ec5d0d1" PRIMARY KEY ("id")`);
    }

}
