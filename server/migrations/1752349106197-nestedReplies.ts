import { MigrationInterface, QueryRunner } from "typeorm";

export class NestedReplies1752349106197 implements MigrationInterface {
    name = 'NestedReplies1752349106197'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reply" ADD "parentId" integer`);
        await queryRunner.query(`ALTER TABLE "reply" ADD CONSTRAINT "FK_853da4dcaed90e6881f2d3279c2" FOREIGN KEY ("parentId") REFERENCES "reply"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reply" DROP CONSTRAINT "FK_853da4dcaed90e6881f2d3279c2"`);
        await queryRunner.query(`ALTER TABLE "reply" DROP COLUMN "parentId"`);
    }

}
