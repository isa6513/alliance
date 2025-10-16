import { MigrationInterface, QueryRunner } from "typeorm";

export class Nullablevisibleat1760650031668 implements MigrationInterface {
    name = 'Nullablevisibleat1760650031668'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "visibleAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "visibleAt" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "visibleAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "visibleAt" SET NOT NULL`);
    }

}
