import { MigrationInterface, QueryRunner } from "typeorm";

export class NoneStat1770664618054 implements MigrationInterface {
    name = 'NoneStat1770664618054'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."action_customstattype_enum" RENAME TO "action_customstattype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."action_customstattype_enum" AS ENUM('none', 'users_invited')`);
        await queryRunner.query(`ALTER TABLE "action" ALTER COLUMN "customStatType" TYPE "public"."action_customstattype_enum" USING "customStatType"::"text"::"public"."action_customstattype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."action_customstattype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."action_customstattype_enum_old" AS ENUM('users_invited')`);
        await queryRunner.query(`ALTER TABLE "action" ALTER COLUMN "customStatType" TYPE "public"."action_customstattype_enum_old" USING "customStatType"::"text"::"public"."action_customstattype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."action_customstattype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."action_customstattype_enum_old" RENAME TO "action_customstattype_enum"`);
    }

}
