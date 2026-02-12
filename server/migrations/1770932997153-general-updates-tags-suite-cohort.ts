import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneralUpdatesTagsSuiteCohort1770932997153 implements MigrationInterface {
    name = 'GeneralUpdatesTagsSuiteCohort1770932997153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "general_update_tags_tag" ("generalUpdateId" integer NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_53c36746319fa8b3f78de3d3045" PRIMARY KEY ("generalUpdateId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5842698523021c04900448acc5" ON "general_update_tags_tag" ("generalUpdateId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e492c38f035f2ea1822761390b" ON "general_update_tags_tag" ("tagId") `);
        await queryRunner.query(`CREATE TABLE "tag_general_updates_general_update" ("tagId" uuid NOT NULL, "generalUpdateId" integer NOT NULL, CONSTRAINT "PK_93cc883887ba3578c6d225e3d44" PRIMARY KEY ("tagId", "generalUpdateId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_065e00a2639af0395048fcd9d4" ON "tag_general_updates_general_update" ("tagId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4179a2a7b35c1bb3e877f310e0" ON "tag_general_updates_general_update" ("generalUpdateId") `);
        await queryRunner.query(`ALTER TABLE "general_update" ADD "useManualCohort" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "general_update" ADD "manualCohortUserIds" integer array`);
        await queryRunner.query(`ALTER TABLE "general_update" ADD "suiteId" integer`);
        await queryRunner.query(`ALTER TABLE "general_update" ADD CONSTRAINT "FK_678c658468d9a902f935565f8de" FOREIGN KEY ("suiteId") REFERENCES "action_suite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "general_update_tags_tag" ADD CONSTRAINT "FK_5842698523021c04900448acc54" FOREIGN KEY ("generalUpdateId") REFERENCES "general_update"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "general_update_tags_tag" ADD CONSTRAINT "FK_e492c38f035f2ea1822761390b5" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tag_general_updates_general_update" ADD CONSTRAINT "FK_065e00a2639af0395048fcd9d48" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tag_general_updates_general_update" ADD CONSTRAINT "FK_4179a2a7b35c1bb3e877f310e0b" FOREIGN KEY ("generalUpdateId") REFERENCES "general_update"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tag_general_updates_general_update" DROP CONSTRAINT "FK_4179a2a7b35c1bb3e877f310e0b"`);
        await queryRunner.query(`ALTER TABLE "tag_general_updates_general_update" DROP CONSTRAINT "FK_065e00a2639af0395048fcd9d48"`);
        await queryRunner.query(`ALTER TABLE "general_update_tags_tag" DROP CONSTRAINT "FK_e492c38f035f2ea1822761390b5"`);
        await queryRunner.query(`ALTER TABLE "general_update_tags_tag" DROP CONSTRAINT "FK_5842698523021c04900448acc54"`);
        await queryRunner.query(`ALTER TABLE "general_update" DROP CONSTRAINT "FK_678c658468d9a902f935565f8de"`);
        await queryRunner.query(`ALTER TABLE "general_update" DROP COLUMN "suiteId"`);
        await queryRunner.query(`ALTER TABLE "general_update" DROP COLUMN "manualCohortUserIds"`);
        await queryRunner.query(`ALTER TABLE "general_update" DROP COLUMN "useManualCohort"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4179a2a7b35c1bb3e877f310e0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_065e00a2639af0395048fcd9d4"`);
        await queryRunner.query(`DROP TABLE "tag_general_updates_general_update"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e492c38f035f2ea1822761390b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5842698523021c04900448acc5"`);
        await queryRunner.query(`DROP TABLE "general_update_tags_tag"`);
    }

}
