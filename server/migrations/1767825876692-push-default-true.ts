import { MigrationInterface, QueryRunner } from "typeorm";

export class PushDefaultTrue1767825876692 implements MigrationInterface {
    name = 'PushDefaultTrue1767825876692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "shouldPush" SET DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "shouldPush" SET DEFAULT false`);
    }

}
