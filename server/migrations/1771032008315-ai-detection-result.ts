import { MigrationInterface, QueryRunner } from "typeorm";

export class AiDetectionResult1771032008315 implements MigrationInterface {
    name = 'AiDetectionResult1771032008315'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ai_detection_result_entitytype_enum" AS ENUM('comment', 'formResponse')`);
        await queryRunner.query(`CREATE TYPE "public"."ai_detection_result_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "ai_detection_result" ("id" SERIAL NOT NULL, "entityType" "public"."ai_detection_result_entitytype_enum" NOT NULL, "entityId" integer NOT NULL, "fieldPath" text NOT NULL, "status" "public"."ai_detection_result_status_enum" NOT NULL DEFAULT 'pending', "aiProbability" double precision, "rawApiResponse" jsonb, "modelVersion" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6917a713f11068a75ef6edb53f2" UNIQUE ("entityType", "entityId", "fieldPath"), CONSTRAINT "PK_891d5d2c4a9e3f9acb5a63de58e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ai_detection_result"`);
        await queryRunner.query(`DROP TYPE "public"."ai_detection_result_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ai_detection_result_entitytype_enum"`);
    }

}
