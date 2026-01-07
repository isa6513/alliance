import { MigrationInterface, QueryRunner } from "typeorm";

export class PushNotifPrefs1767818951964 implements MigrationInterface {
    name = 'PushNotifPrefs1767818951964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push" ADD "idempotencyKey" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "pushesForLikes" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "pushesForComments" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "pushesForFriendRequests" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f5a7d64ef41260aecf95941796" ON "push" ("idempotencyKey") WHERE "idempotencyKey" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f5a7d64ef41260aecf95941796"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "pushesForFriendRequests"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "pushesForComments"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "pushesForLikes"`);
        await queryRunner.query(`ALTER TABLE "push" DROP COLUMN "idempotencyKey"`);
    }

}
