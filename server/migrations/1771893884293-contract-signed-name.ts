import { MigrationInterface, QueryRunner } from "typeorm";

export class ContractSignedName1771893884293 implements MigrationInterface {
    name = 'ContractSignedName1771893884293'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contract_event" ADD "signedName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contract_event" DROP COLUMN "signedName"`);
    }

}
