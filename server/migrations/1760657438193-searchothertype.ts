import { MigrationInterface, QueryRunner } from "typeorm";

export class Searchothertype1760657438193 implements MigrationInterface {
    name = 'Searchothertype1760657438193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."recent_search_objecttype_enum" RENAME TO "recent_search_objecttype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."recent_search_objecttype_enum" AS ENUM('user', 'action', 'post', 'recent', 'other')`);
        await queryRunner.query(`ALTER TABLE "recent_search" ALTER COLUMN "objectType" TYPE "public"."recent_search_objecttype_enum" USING "objectType"::"text"::"public"."recent_search_objecttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."recent_search_objecttype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."recent_search_objecttype_enum_old" AS ENUM('user', 'action', 'post', 'recent')`);
        await queryRunner.query(`ALTER TABLE "recent_search" ALTER COLUMN "objectType" TYPE "public"."recent_search_objecttype_enum_old" USING "objectType"::"text"::"public"."recent_search_objecttype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."recent_search_objecttype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."recent_search_objecttype_enum_old" RENAME TO "recent_search_objecttype_enum"`);
    }

}
