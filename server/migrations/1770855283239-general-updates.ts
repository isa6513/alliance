import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneralUpdates1770855283239 implements MigrationInterface {
    name = 'GeneralUpdates1770855283239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "general_update" ("id" SERIAL NOT NULL, "name" text NOT NULL, "schema" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "startDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "endDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_201359354629765585fe2ac2e46" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."general_update_activity_type_enum" AS ENUM('dismissed')`);
        await queryRunner.query(`CREATE TABLE "general_update_activity" ("id" SERIAL NOT NULL, "type" "public"."general_update_activity_type_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "generalUpdateId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_14eb00b2fd7871704463a263f7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "general_update_activity" ADD CONSTRAINT "FK_3e4c252dcc4780666736cbb0d69" FOREIGN KEY ("generalUpdateId") REFERENCES "general_update"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "general_update_activity" ADD CONSTRAINT "FK_61c4290c1df3b28fc86c94b117f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general_update_activity" DROP CONSTRAINT "FK_61c4290c1df3b28fc86c94b117f"`);
        await queryRunner.query(`ALTER TABLE "general_update_activity" DROP CONSTRAINT "FK_3e4c252dcc4780666736cbb0d69"`);
        await queryRunner.query(`DROP TABLE "general_update_activity"`);
        await queryRunner.query(`DROP TYPE "public"."general_update_activity_type_enum"`);
        await queryRunner.query(`DROP TABLE "general_update"`);
    }

}
