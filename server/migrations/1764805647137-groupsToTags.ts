import { MigrationInterface, QueryRunner } from 'typeorm';

export class GroupsToTags1764805647137 implements MigrationInterface {
  name = 'GroupsToTags1764805647137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_update" DROP CONSTRAINT "FK_ad84b8165f92de9a2e0d63494e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminder_group" DROP CONSTRAINT "FK_566d48f4c9ce5594bb63a96790c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_update" RENAME COLUMN "groupId" TO "tagId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminder_group" RENAME COLUMN "userGroupId" TO "userTagId"`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "publicDisplayName" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`INSERT INTO "tag" SELECT * FROM "group"`);
    await queryRunner.query(
      `CREATE TABLE "tag_users_user" ("tagId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_095c7eb736c8f563d9066c8b0a6" PRIMARY KEY ("tagId", "userId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "tag_users_user" ("tagId", "userId") SELECT "groupId", "userId" FROM "group_users_user"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac2dc02851d77738e7aba2782f" ON "tag_users_user" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1336a7e2e9fcac3b052e397f4b" ON "tag_users_user" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tag_participating_in_action" ("tagId" integer NOT NULL, "actionId" integer NOT NULL, CONSTRAINT "PK_368d457b6a338de19d40a37b8a5" PRIMARY KEY ("tagId", "actionId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "tag_participating_in_action" ("tagId", "actionId") SELECT "groupId", "actionId" FROM "group_participating_in_action"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b0a20bd6ef1b97861a20e194b9" ON "tag_participating_in_action" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b62b70e20a2fc1a450658b2ef7" ON "tag_participating_in_action" ("actionId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "action_participating_tags_tag" ("actionId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "PK_0a6c24ad104c01e8fb53ceaa543" PRIMARY KEY ("actionId", "tagId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "action_participating_tags_tag" ("actionId", "tagId") SELECT "actionId", "groupId" FROM "action_participating_groups_group"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7bd8e2e28e847d95aed0ee69bb" ON "action_participating_tags_tag" ("actionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_488f25c6897226813db2de109e" ON "action_participating_tags_tag" ("tagId") `,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."action_update_notifytype_enum" RENAME TO "action_update_notifytype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."action_update_notifytype_enum" AS ENUM('none', 'action_cohort', 'all_members', 'tag')`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_update" ALTER COLUMN "notifyType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_update" ALTER COLUMN "notifyType" TYPE "public"."action_update_notifytype_enum" USING "notifyType"::"text"::"public"."action_update_notifytype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_update" ALTER COLUMN "notifyType" SET DEFAULT 'none'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."action_update_notifytype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."reminder_group_cohorttype_enum" RENAME TO "reminder_group_cohorttype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reminder_group_cohorttype_enum" AS ENUM('all_uncompleted', 'tag', 'custom')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminder_group" ALTER COLUMN "cohortType" TYPE "public"."reminder_group_cohorttype_enum" USING "cohortType"::"text"::"public"."reminder_group_cohorttype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."reminder_group_cohorttype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_update" ADD CONSTRAINT "FK_de574ee379db67b585ac575549e" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminder_group" ADD CONSTRAINT "FK_dbb157db646be57f5e14f7deedf" FOREIGN KEY ("userTagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_users_user" ADD CONSTRAINT "FK_ac2dc02851d77738e7aba2782fe" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_users_user" ADD CONSTRAINT "FK_1336a7e2e9fcac3b052e397f4ba" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_participating_in_action" ADD CONSTRAINT "FK_b0a20bd6ef1b97861a20e194b99" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_participating_in_action" ADD CONSTRAINT "FK_b62b70e20a2fc1a450658b2ef75" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_participating_tags_tag" ADD CONSTRAINT "FK_7bd8e2e28e847d95aed0ee69bba" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_participating_tags_tag" ADD CONSTRAINT "FK_488f25c6897226813db2de109eb" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_participating_tags_tag" DROP CONSTRAINT "FK_488f25c6897226813db2de109eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_participating_tags_tag" DROP CONSTRAINT "FK_7bd8e2e28e847d95aed0ee69bba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_participating_in_action" DROP CONSTRAINT "FK_b62b70e20a2fc1a450658b2ef75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_participating_in_action" DROP CONSTRAINT "FK_b0a20bd6ef1b97861a20e194b99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_users_user" DROP CONSTRAINT "FK_1336a7e2e9fcac3b052e397f4ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_users_user" DROP CONSTRAINT "FK_ac2dc02851d77738e7aba2782fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminder_group" DROP CONSTRAINT "FK_dbb157db646be57f5e14f7deedf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_update" DROP CONSTRAINT "FK_de574ee379db67b585ac575549e"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reminder_group_cohorttype_enum_old" AS ENUM('all_uncompleted', 'group', 'custom')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminder_group" ALTER COLUMN "cohortType" TYPE "public"."reminder_group_cohorttype_enum_old" USING "cohortType"::"text"::"public"."reminder_group_cohorttype_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."reminder_group_cohorttype_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."reminder_group_cohorttype_enum_old" RENAME TO "reminder_group_cohorttype_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."action_update_notifytype_enum_old" AS ENUM('none', 'action_cohort', 'all_members', 'group')`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_update" ALTER COLUMN "notifyType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_update" ALTER COLUMN "notifyType" TYPE "public"."action_update_notifytype_enum_old" USING "notifyType"::"text"::"public"."action_update_notifytype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_update" ALTER COLUMN "notifyType" SET DEFAULT 'none'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."action_update_notifytype_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."action_update_notifytype_enum_old" RENAME TO "action_update_notifytype_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_488f25c6897226813db2de109e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7bd8e2e28e847d95aed0ee69bb"`,
    );
    await queryRunner.query(`DROP TABLE "action_participating_tags_tag"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b62b70e20a2fc1a450658b2ef7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b0a20bd6ef1b97861a20e194b9"`,
    );
    await queryRunner.query(`DROP TABLE "tag_participating_in_action"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1336a7e2e9fcac3b052e397f4b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac2dc02851d77738e7aba2782f"`,
    );
    await queryRunner.query(`DROP TABLE "tag_users_user"`);
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(
      `ALTER TABLE "reminder_group" RENAME COLUMN "userTagId" TO "userGroupId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_update" RENAME COLUMN "tagId" TO "groupId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reminder_group" ADD CONSTRAINT "FK_566d48f4c9ce5594bb63a96790c" FOREIGN KEY ("userGroupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_update" ADD CONSTRAINT "FK_ad84b8165f92de9a2e0d63494e7" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
