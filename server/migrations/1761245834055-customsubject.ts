import { MigrationInterface, QueryRunner } from "typeorm";

export class Customsubject1761245834055 implements MigrationInterface {
    name = 'Customsubject1761245834055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_reminder" ADD "customEmailSubject" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_reminder" DROP COLUMN "customEmailSubject"`);
    }

}
