import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillCommentLikes1779480049252 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE "comment" c
        SET "likesCount" = COALESCE(lc."likeCount", 0)
        FROM (
          SELECT "commentId" AS "commentId",
                 COUNT(*)::integer AS "likeCount"
          FROM "comment_likes_user"
          GROUP BY "commentId"
        ) lc
        WHERE lc."commentId" = c.id
      `);
  }

  public async down(): Promise<void> {}
}
