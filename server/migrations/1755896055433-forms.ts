import { MigrationInterface, QueryRunner } from "typeorm";

export class Forms1755896055433 implements MigrationInterface {
    name = 'Forms1755896055433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "form_response" ("id" SERIAL NOT NULL, "formId" integer NOT NULL, "answers" jsonb NOT NULL, "userId" integer, CONSTRAINT "PK_590558d307109b9ee2aa8f8e8e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "form" ("id" SERIAL NOT NULL, "title" text NOT NULL, "schema" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8f72b95aa2f8ba82cf95dc7579e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "form_response" ADD CONSTRAINT "FK_377d5f3d5ecb0c02e785dda5fdc" FOREIGN KEY ("formId") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "form_response" ADD CONSTRAINT "FK_3600cba60926c01106e6818d693" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" DROP CONSTRAINT "FK_3600cba60926c01106e6818d693"`);
        await queryRunner.query(`ALTER TABLE "form_response" DROP CONSTRAINT "FK_377d5f3d5ecb0c02e785dda5fdc"`);
        await queryRunner.query(`DROP TABLE "form"`);
        await queryRunner.query(`DROP TABLE "form_response"`);
    }

}
