import { MigrationInterface, QueryRunner } from 'typeorm';

export class DigestLog1758778210913 implements MigrationInterface {
  name = 'DigestLog1758778210913';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "forum_digest_log" ("id" SERIAL NOT NULL, "digestDate" date NOT NULL, "preferenceUsed" "public"."user_forumdigestpreference_enum" NOT NULL, "notificationsCount" integer NOT NULL, "notificationIds" integer array NOT NULL DEFAULT '{}', "notificationsSummary" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "UQ_3decf9c272d99420d12117b417d" UNIQUE ("userId", "digestDate"), CONSTRAINT "PK_fa054fb646d4ed2f621ce76754e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "forum_digest_log" ADD CONSTRAINT "FK_de674e50a7a30010e79ba980027" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forum_digest_log" DROP CONSTRAINT "FK_de674e50a7a30010e79ba980027"`,
    );
    await queryRunner.query(`DROP TABLE "forum_digest_log"`);
  }
}
