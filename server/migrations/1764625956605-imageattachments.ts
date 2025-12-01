import { MigrationInterface, QueryRunner } from "typeorm";

export class Imageattachments1764625956605 implements MigrationInterface {
    name = 'Imageattachments1764625956605'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" ADD "attachments" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "attachments"`);
    }

}
