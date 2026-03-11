import { MigrationInterface, QueryRunner } from "typeorm";

export class FollowUpForm1773248944962 implements MigrationInterface {
    name = 'FollowUpForm1773248944962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "follow_up_form" ("id" SERIAL NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE, "endDate" TIMESTAMP WITH TIME ZONE, "name" text, "actionId" integer NOT NULL, "formId" integer NOT NULL, CONSTRAINT "PK_c0022e81778e2481bf51c46a1ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "follow_up_form" ADD CONSTRAINT "FK_713231c6174c6c7d00d32ae90b2" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follow_up_form" ADD CONSTRAINT "FK_a5be1d9a6b8ab30a8dbc0bce7e8" FOREIGN KEY ("formId") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "follow_up_form" DROP CONSTRAINT "FK_a5be1d9a6b8ab30a8dbc0bce7e8"`);
        await queryRunner.query(`ALTER TABLE "follow_up_form" DROP CONSTRAINT "FK_713231c6174c6c7d00d32ae90b2"`);
        await queryRunner.query(`DROP TABLE "follow_up_form"`);
    }

}
