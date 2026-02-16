import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneralUpdatesSuitesManyToMany1771268388786 implements MigrationInterface {
    name = 'GeneralUpdatesSuitesManyToMany1771268388786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general_update" DROP CONSTRAINT "FK_678c658468d9a902f935565f8de"`);
        await queryRunner.query(`CREATE TABLE "general_update_suites_action_suite" ("generalUpdateId" integer NOT NULL, "actionSuiteId" integer NOT NULL, CONSTRAINT "PK_bbeadd23295995a9ff3540d05c9" PRIMARY KEY ("generalUpdateId", "actionSuiteId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d039798b9a17f2d29205a3c4c3" ON "general_update_suites_action_suite" ("generalUpdateId") `);
        await queryRunner.query(`CREATE INDEX "IDX_35570d6c1d1649132b45e93cd8" ON "general_update_suites_action_suite" ("actionSuiteId") `);
        await queryRunner.query(`ALTER TABLE "general_update" DROP COLUMN "suiteId"`);
        await queryRunner.query(`ALTER TABLE "general_update_suites_action_suite" ADD CONSTRAINT "FK_d039798b9a17f2d29205a3c4c39" FOREIGN KEY ("generalUpdateId") REFERENCES "general_update"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "general_update_suites_action_suite" ADD CONSTRAINT "FK_35570d6c1d1649132b45e93cd8f" FOREIGN KEY ("actionSuiteId") REFERENCES "action_suite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general_update_suites_action_suite" DROP CONSTRAINT "FK_35570d6c1d1649132b45e93cd8f"`);
        await queryRunner.query(`ALTER TABLE "general_update_suites_action_suite" DROP CONSTRAINT "FK_d039798b9a17f2d29205a3c4c39"`);
        await queryRunner.query(`ALTER TABLE "general_update" ADD "suiteId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_35570d6c1d1649132b45e93cd8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d039798b9a17f2d29205a3c4c3"`);
        await queryRunner.query(`DROP TABLE "general_update_suites_action_suite"`);
        await queryRunner.query(`ALTER TABLE "general_update" ADD CONSTRAINT "FK_678c658468d9a902f935565f8de" FOREIGN KEY ("suiteId") REFERENCES "action_suite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
