import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDate1762383251845 implements MigrationInterface {
    name = 'UpdateDate1762383251845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_ca6c77e63273e35f3cdb07632f9"`);
        await queryRunner.query(`ALTER TABLE "action_update" RENAME COLUMN "displayDate" TO "date"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_ca6c77e63273e35f3cdb07632f9" FOREIGN KEY ("actionUpdateId") REFERENCES "action_update"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_ca6c77e63273e35f3cdb07632f9"`);
        await queryRunner.query(`ALTER TABLE "action_update" RENAME COLUMN "date" TO "displayDate"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_ca6c77e63273e35f3cdb07632f9" FOREIGN KEY ("actionUpdateId") REFERENCES "action_update"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
