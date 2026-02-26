import { MigrationInterface, QueryRunner } from 'typeorm';

export class PageSearchType1772066660916 implements MigrationInterface {
  name = 'PageSearchType1772066660916';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."recent_search_objecttype_enum" ADD VALUE 'page'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."recent_search_objecttype_enum_old" AS ENUM('user', 'action', 'post', 'recent', 'other')`,
    );
    await queryRunner.query(
      `ALTER TABLE "recent_search" ALTER COLUMN "objectType" TYPE "public"."recent_search_objecttype_enum_old" USING "objectType"::"text"::"public"."recent_search_objecttype_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."recent_search_objecttype_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."recent_search_objecttype_enum_old" RENAME TO "recent_search_objecttype_enum"`,
    );
  }
}
