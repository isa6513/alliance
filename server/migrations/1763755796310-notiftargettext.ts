import { MigrationInterface, QueryRunner } from "typeorm";

export class Notiftargettext1763755796310 implements MigrationInterface {
    name = 'Notiftargettext1763755796310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ADD "targetContent" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "targetContent"`);
    }

}
