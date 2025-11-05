import { MigrationInterface, QueryRunner } from "typeorm";

export class Usersjoinedcolumn1762368533743 implements MigrationInterface {
    name = 'Usersjoinedcolumn1762368533743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "usersJoined" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "usersJoined"`);
    }

}
