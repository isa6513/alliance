import { MigrationInterface, QueryRunner } from "typeorm";

export class DeletedReplyBool1753142216990 implements MigrationInterface {
    name = 'DeletedReplyBool1753142216990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reply" ADD "deleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reply" DROP COLUMN "deleted"`);
    }

}
