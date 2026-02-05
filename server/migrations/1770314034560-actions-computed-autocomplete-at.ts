import { MigrationInterface, QueryRunner } from "typeorm";

export class ActionsComputedAutocompleteAt1770314034560 implements MigrationInterface {
    name = 'ActionsComputedAutocompleteAt1770314034560'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "computedAutocompleteAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "computedAutocompleteAt"`);
    }

}
