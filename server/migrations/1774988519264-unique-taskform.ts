import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueTaskform1774988519264 implements MigrationInterface {
    name = 'UniqueTaskform1774988519264'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD CONSTRAINT "UQ_21c0329044bd977340b9c86c2cf" UNIQUE ("taskFormId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP CONSTRAINT "UQ_21c0329044bd977340b9c86c2cf"`);
    }

}
