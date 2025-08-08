import { MigrationInterface, QueryRunner } from "typeorm";

export class Recentsearches1754679631095 implements MigrationInterface {
    name = 'Recentsearches1754679631095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."recent_search_objecttype_enum" AS ENUM('user', 'action', 'post')`);
        await queryRunner.query(`CREATE TABLE "recent_search" ("id" SERIAL NOT NULL, "objectId" integer NOT NULL, "objectType" "public"."recent_search_objecttype_enum" NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_028dfa7d985553e500797e1b8c8" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "recent_search"`);
        await queryRunner.query(`DROP TYPE "public"."recent_search_objecttype_enum"`);
    }

}
