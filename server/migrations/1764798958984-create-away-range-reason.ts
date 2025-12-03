import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAwayRangeReason1764798958984 implements MigrationInterface {
    name = 'CreateAwayRangeReason1764798958984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_away_range_reason_enum" AS ENUM('vacation', 'emergency', 'other')`);
        await queryRunner.query(`ALTER TABLE "user_away_range" ADD "reason" "public"."user_away_range_reason_enum" NOT NULL DEFAULT 'other'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_away_range" DROP COLUMN "reason"`);
        await queryRunner.query(`DROP TYPE "public"."user_away_range_reason_enum"`);
    }

}
