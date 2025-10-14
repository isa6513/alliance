import { MigrationInterface, QueryRunner } from "typeorm";

export class Customvalidatorenitity1760481651646 implements MigrationInterface {
    name = 'Customvalidatorenitity1760481651646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "custom_validator" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "idArgument" integer, CONSTRAINT "PK_96663d08aadf09369bd67e60e9f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "custom_validator"`);
    }

}
