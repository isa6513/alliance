import { MigrationInterface, QueryRunner } from "typeorm";

export class Changeactionformrelation1755909439830 implements MigrationInterface {
    name = 'Changeactionformrelation1755909439830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "taskFormId" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "taskFormId"`);
    }

}
