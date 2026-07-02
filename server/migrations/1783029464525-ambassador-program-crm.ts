import { MigrationInterface, QueryRunner } from "typeorm";

export class AmbassadorProgramCrm1783029464525 implements MigrationInterface {
    name = 'AmbassadorProgramCrm1783029464525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_90b0cb7ea8b924fd59eb08f6bb"`);
        await queryRunner.query(`CREATE TABLE "ambassador_program_interaction" ("id" SERIAL NOT NULL, "text" text NOT NULL, "interactionDate" date NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "programMemberId" integer NOT NULL, "createdById" integer, CONSTRAINT "PK_762523f7343e0ba4b6849421105" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6bd10c97e3857b66dc0c0b3d60" ON "ambassador_program_interaction" ("programMemberId", "interactionDate") `);
        await queryRunner.query(`CREATE TABLE "ambassador_program_member" ("id" SERIAL NOT NULL, "invited" boolean NOT NULL DEFAULT false, "activeParticipant" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "PK_642c1d7e9a6ca207bd8d01ecc81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bc03cc5098c6edb8fe0a209198" ON "ambassador_program_member" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c34cceaba9b4937fecf39b9fca" ON "ambassador_invite_goal" ("ambassadorId", "startAt", "dueAt") `);
        await queryRunner.query(`ALTER TABLE "ambassador_program_interaction" ADD CONSTRAINT "FK_7f3b8d5916afb09523f4320d964" FOREIGN KEY ("programMemberId") REFERENCES "ambassador_program_member"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ambassador_program_interaction" ADD CONSTRAINT "FK_2b64d45e54c5d2bc6baa3ac3b50" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ambassador_program_member" ADD CONSTRAINT "FK_bc03cc5098c6edb8fe0a2091986" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ambassador_program_member" DROP CONSTRAINT "FK_bc03cc5098c6edb8fe0a2091986"`);
        await queryRunner.query(`ALTER TABLE "ambassador_program_interaction" DROP CONSTRAINT "FK_2b64d45e54c5d2bc6baa3ac3b50"`);
        await queryRunner.query(`ALTER TABLE "ambassador_program_interaction" DROP CONSTRAINT "FK_7f3b8d5916afb09523f4320d964"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c34cceaba9b4937fecf39b9fca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc03cc5098c6edb8fe0a209198"`);
        await queryRunner.query(`DROP TABLE "ambassador_program_member"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6bd10c97e3857b66dc0c0b3d60"`);
        await queryRunner.query(`DROP TABLE "ambassador_program_interaction"`);
        await queryRunner.query(`CREATE INDEX "IDX_90b0cb7ea8b924fd59eb08f6bb" ON "ambassador_invite_goal" ("ambassadorId", "dueAt", "startAt") `);
    }

}
