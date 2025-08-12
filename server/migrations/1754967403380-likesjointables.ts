import { MigrationInterface, QueryRunner } from 'typeorm';

export class Likesjointables1754967403380 implements MigrationInterface {
  name = 'Likesjointables1754967403380';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "action_activity_comment_likes_user" ("actionActivityCommentId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_0e200f4fb2e6e108d13ac288fd9" PRIMARY KEY ("actionActivityCommentId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_17b572f3cd8b553a625c1b5650" ON "action_activity_comment_likes_user" ("actionActivityCommentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_68566be22dc060e05a74e631f2" ON "action_activity_comment_likes_user" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "action_activity_likes_user" ("actionActivityId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_f784ded2d25b84acd8be7254982" PRIMARY KEY ("actionActivityId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d4ca1aad756e65a301a90daed1" ON "action_activity_likes_user" ("actionActivityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b54707a37309bc7d1ebae52044" ON "action_activity_likes_user" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity_comment_likes_user" ADD CONSTRAINT "FK_17b572f3cd8b553a625c1b5650f" FOREIGN KEY ("actionActivityCommentId") REFERENCES "action_activity_comment"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity_comment_likes_user" ADD CONSTRAINT "FK_68566be22dc060e05a74e631f29" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity_likes_user" ADD CONSTRAINT "FK_d4ca1aad756e65a301a90daed1b" FOREIGN KEY ("actionActivityId") REFERENCES "action_activity"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity_likes_user" ADD CONSTRAINT "FK_b54707a37309bc7d1ebae52044e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_activity_likes_user" DROP CONSTRAINT "FK_b54707a37309bc7d1ebae52044e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity_likes_user" DROP CONSTRAINT "FK_d4ca1aad756e65a301a90daed1b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity_comment_likes_user" DROP CONSTRAINT "FK_68566be22dc060e05a74e631f29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_activity_comment_likes_user" DROP CONSTRAINT "FK_17b572f3cd8b553a625c1b5650f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b54707a37309bc7d1ebae52044"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d4ca1aad756e65a301a90daed1"`,
    );
    await queryRunner.query(`DROP TABLE "action_activity_likes_user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_68566be22dc060e05a74e631f2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_17b572f3cd8b553a625c1b5650"`,
    );
    await queryRunner.query(`DROP TABLE "action_activity_comment_likes_user"`);
  }
}
