import { MigrationInterface, QueryRunner } from "typeorm";

export class ContractFlag1770240614835 implements MigrationInterface {
    name = 'ContractFlag1770240614835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "isContractSigningAction" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "isContractSigningAction"`);
    }

}
