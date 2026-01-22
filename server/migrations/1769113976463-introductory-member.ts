import { MigrationInterface, QueryRunner } from 'typeorm';

export class IntroductoryMember1769113976463 implements MigrationInterface {
  name = 'IntroductoryMember1769113976463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "user" u
      SET "isIntroductoryGroupMember" = false
      FROM (
        SELECT DISTINCT ON ("userId") "userId", "type"
        FROM "contract_event"
        ORDER BY "userId", "date" DESC
      ) latest
      WHERE u."id" = latest."userId"
        AND latest."type" = 'signed'
    `);
  }

  public async down(): Promise<void> {}
}
