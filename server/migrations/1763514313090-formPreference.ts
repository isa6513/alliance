import { MigrationInterface, QueryRunner } from "typeorm";

export class FormPreference1763514313090 implements MigrationInterface {
    name = 'FormPreference1763514313090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_formdatapreference_enum" AS ENUM('public', 'private')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "formDataPreference" "public"."user_formdatapreference_enum" NOT NULL DEFAULT 'public'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "formDataPreference"`);
        await queryRunner.query(`DROP TYPE "public"."user_formdatapreference_enum"`);
    }

}
