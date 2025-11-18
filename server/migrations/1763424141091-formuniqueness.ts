import { MigrationInterface, QueryRunner } from 'typeorm';

export class Formuniqueness1763424141091 implements MigrationInterface {
  name = 'Formuniqueness1763424141091';
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove duplicate form_responses per (userId, formId), keeping the latest by createdAt
    await queryRunner.query(`
          DELETE FROM "form_response" fr
          USING (
            SELECT "id"
            FROM (
              SELECT
                "id",
                ROW_NUMBER() OVER (
                  PARTITION BY "userId", "formId"
                  ORDER BY "createdAt" DESC, "id" DESC
                ) AS rn
              FROM "form_response"
            ) sub
            WHERE sub.rn > 1
          ) dups
          WHERE fr."id" = dups."id";
        `);

    await queryRunner.query(`
          ALTER TABLE "form_response"
          ADD CONSTRAINT "UQ_596e5cea71948ee219d37c6ef51"
          UNIQUE ("userId", "formId")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_response" DROP CONSTRAINT "UQ_596e5cea71948ee219d37c6ef51"`,
    );
  }
}
