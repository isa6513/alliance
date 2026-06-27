import { MigrationInterface, QueryRunner } from "typeorm";

export class AmbassadorInviteGoal1782541035887 implements MigrationInterface {
    name = 'AmbassadorInviteGoal1782541035887'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ambassador_invite_goal" ("id" SERIAL NOT NULL, "targetSuccessfulRecruits" integer NOT NULL, "startAt" TIMESTAMP WITH TIME ZONE NOT NULL, "dueAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ambassadorId" integer NOT NULL, CONSTRAINT "PK_c7aea9765bf8a259155d3d05e1b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_90b0cb7ea8b924fd59eb08f6bb" ON "ambassador_invite_goal" ("ambassadorId", "startAt", "dueAt") `);
        await queryRunner.query(`ALTER TABLE "ambassador_invite_goal" ADD CONSTRAINT "FK_dc7960e341a2f1ea515cf1835f5" FOREIGN KEY ("ambassadorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ambassador_invite_goal" DROP CONSTRAINT "FK_dc7960e341a2f1ea515cf1835f5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_90b0cb7ea8b924fd59eb08f6bb"`);
        await queryRunner.query(`DROP TABLE "ambassador_invite_goal"`);
    }

}
