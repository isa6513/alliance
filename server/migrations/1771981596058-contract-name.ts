import { MigrationInterface, QueryRunner } from "typeorm";

export class ContractName1771981596058 implements MigrationInterface {
    name = 'ContractName1771981596058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contract" ADD "name" text`);
        await queryRunner.query(`ALTER TABLE "contract_event" ADD CONSTRAINT "CHK_11daccb3e1c08ea9b0b6c2dc11" CHECK ("type" != 'signed' OR "contractId" IS NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contract_event" DROP CONSTRAINT "CHK_11daccb3e1c08ea9b0b6c2dc11"`);
        await queryRunner.query(`ALTER TABLE "contract" DROP COLUMN "name"`);
    }

}
