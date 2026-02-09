import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomStatValue1770659668385 implements MigrationInterface {
    name = 'CustomStatValue1770659668385'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."action_customstattype_enum" AS ENUM('users_invited')`);
        await queryRunner.query(`ALTER TABLE "action" ADD "customStatType" "public"."action_customstattype_enum"`);
        await queryRunner.query(`ALTER TABLE "action" ADD "customStatLabel" character varying`);
        await queryRunner.query(`ALTER TABLE "action" ADD "customStatValue" integer`);
        await queryRunner.query(`ALTER TABLE "action" ADD "customStatGoal" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "customStatGoal"`);
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "customStatValue"`);
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "customStatLabel"`);
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "customStatType"`);
        await queryRunner.query(`DROP TYPE "public"."action_customstattype_enum"`);
    }

}
