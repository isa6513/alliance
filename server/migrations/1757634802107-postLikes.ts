import { MigrationInterface, QueryRunner } from "typeorm";

export class PostLikes1757634802107 implements MigrationInterface {
    name = 'PostLikes1757634802107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_likes_user" ("postId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_91dfae767678b39354875c2894f" PRIMARY KEY ("postId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_631290356ede4fcbb402128732" ON "post_likes_user" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ec7439ad132e39ffe77fba5fed" ON "post_likes_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "post_likes_user" ADD CONSTRAINT "FK_631290356ede4fcbb4021287321" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_likes_user" ADD CONSTRAINT "FK_ec7439ad132e39ffe77fba5fed9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_likes_user" DROP CONSTRAINT "FK_ec7439ad132e39ffe77fba5fed9"`);
        await queryRunner.query(`ALTER TABLE "post_likes_user" DROP CONSTRAINT "FK_631290356ede4fcbb4021287321"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ec7439ad132e39ffe77fba5fed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_631290356ede4fcbb402128732"`);
        await queryRunner.query(`DROP TABLE "post_likes_user"`);
    }

}
