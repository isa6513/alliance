import { MigrationInterface, QueryRunner } from "typeorm";

export class ActionAuthors1765479400717 implements MigrationInterface {
    name = 'ActionAuthors1765479400717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "action_authors_user" ("actionId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_6768188568e61ffce02d6486224" PRIMARY KEY ("actionId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cf12f6bdbaf03a9b6b62c7ccd7" ON "action_authors_user" ("actionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7cdf718f68ee929831cb33791d" ON "action_authors_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "action_authors_user" ADD CONSTRAINT "FK_cf12f6bdbaf03a9b6b62c7ccd7a" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "action_authors_user" ADD CONSTRAINT "FK_7cdf718f68ee929831cb33791d5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_authors_user" DROP CONSTRAINT "FK_7cdf718f68ee929831cb33791d5"`);
        await queryRunner.query(`ALTER TABLE "action_authors_user" DROP CONSTRAINT "FK_cf12f6bdbaf03a9b6b62c7ccd7a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7cdf718f68ee929831cb33791d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cf12f6bdbaf03a9b6b62c7ccd7"`);
        await queryRunner.query(`DROP TABLE "action_authors_user"`);
    }

}
