import { MigrationInterface, QueryRunner } from "typeorm";

export class Deletedpostflag1754617930775 implements MigrationInterface {
    name = 'Deletedpostflag1754617930775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "deleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "deleted"`);
    }

}
