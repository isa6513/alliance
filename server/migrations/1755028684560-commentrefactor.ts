import { MigrationInterface, QueryRunner } from 'typeorm';

export class Commentrefactor1755028684560 implements MigrationInterface {
  name = 'Commentrefactor1755028684560';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."comment_parentobjecttype_enum" AS ENUM('post', 'action', 'activity')`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" SERIAL NOT NULL, "content" text NOT NULL, "authorId" integer NOT NULL, "parentObjectType" "public"."comment_parentobjecttype_enum" NOT NULL, "parentObjectId" integer NOT NULL, "deleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "parentId" integer, "notificationId" integer, CONSTRAINT "REL_1844cb17134d11dae608e2e209" UNIQUE ("notificationId"), CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment_likes_user" ("commentId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_0ccf128d9efb17164fd55b75ef3" PRIMARY KEY ("commentId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b1a1ce2a2776e6850b73de0537" ON "comment_likes_user" ("commentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_03c51abf6cdd2bcf3a9c7b1947" ON "comment_likes_user" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_e3aebe2bd1c53467a07109be596" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_1844cb17134d11dae608e2e209f" FOREIGN KEY ("notificationId") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes_user" ADD CONSTRAINT "FK_b1a1ce2a2776e6850b73de0537c" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes_user" ADD CONSTRAINT "FK_03c51abf6cdd2bcf3a9c7b19476" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment_likes_user" DROP CONSTRAINT "FK_03c51abf6cdd2bcf3a9c7b19476"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes_user" DROP CONSTRAINT "FK_b1a1ce2a2776e6850b73de0537c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_1844cb17134d11dae608e2e209f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_e3aebe2bd1c53467a07109be596"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_03c51abf6cdd2bcf3a9c7b1947"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b1a1ce2a2776e6850b73de0537"`,
    );
    await queryRunner.query(`DROP TABLE "comment_likes_user"`);
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(
      `DROP TYPE "public"."comment_parentobjecttype_enum"`,
    );
  }
}
