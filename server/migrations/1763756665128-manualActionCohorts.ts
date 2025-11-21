import { MigrationInterface, QueryRunner } from "typeorm";

export class ManualActionCohorts1763756665128 implements MigrationInterface {
    name = 'ManualActionCohorts1763756665128'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "action_manual_cohort_users_user" ("actionId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_7fee82bdbd4354a011282584e71" PRIMARY KEY ("actionId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1604350f3dbc7ed40cd3bf53a3" ON "action_manual_cohort_users_user" ("actionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_55722b3246a5420a711fe6674e" ON "action_manual_cohort_users_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "action" ADD "useManualCohort" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "action_manual_cohort_users_user" ADD CONSTRAINT "FK_1604350f3dbc7ed40cd3bf53a37" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "action_manual_cohort_users_user" ADD CONSTRAINT "FK_55722b3246a5420a711fe6674e0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_manual_cohort_users_user" DROP CONSTRAINT "FK_55722b3246a5420a711fe6674e0"`);
        await queryRunner.query(`ALTER TABLE "action_manual_cohort_users_user" DROP CONSTRAINT "FK_1604350f3dbc7ed40cd3bf53a37"`);
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "useManualCohort"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55722b3246a5420a711fe6674e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1604350f3dbc7ed40cd3bf53a3"`);
        await queryRunner.query(`DROP TABLE "action_manual_cohort_users_user"`);
    }

}
