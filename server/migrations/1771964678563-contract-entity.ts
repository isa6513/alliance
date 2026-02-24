import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContractEntity1771964678563 implements MigrationInterface {
  name = 'ContractEntity1771964678563';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contract" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "markdown" character varying NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE, "endDate" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_17c3a89f58a2997276084e706e8" PRIMARY KEY ("id"))`,
    );

    const markdown = [
      '1. I commit to complete up to 15 minutes of Alliance tasks per week.',
      '',
      '2. I commit to complete every task I am assigned by its deadline, unless:',
      '',
      '   a. I have spent more than 15 minutes completing Alliance tasks in the past week.',
      '',
      '   b. I cannot complete the task due to a serious external circumstance, such as a medical issue or family emergency. In this case, I will inform the strategic office as soon as I can.',
      '',
      '   c. I believe the task is immoral. In this case, I will inform the strategic office of my reasoning by the deadline for the task.',
      '',
      '3. I understand that I am considered an active member, and am therefore able to participate in Alliance governance, if I have completed at least 8 of the last 10 tasks I was assigned.',
    ].join('\n');
    await queryRunner.query(
      `INSERT INTO "contract" ("markdown", "startDate", "endDate") VALUES ($1, NOW(), NULL)`,
      [markdown],
    );

    await queryRunner.query(
      `ALTER TABLE "contract_event" ADD "contractId" integer`,
    );
    await queryRunner.query(
      `UPDATE "contract_event" SET "contractId" = 1 WHERE "type" = 'signed'`,
    );

    await queryRunner.query(
      `ALTER TABLE "contract_event" ADD CONSTRAINT "FK_f1a725217ccc409de6ffb6f6a87" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_event" DROP CONSTRAINT "FK_f1a725217ccc409de6ffb6f6a87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_event" DROP COLUMN "contractId"`,
    );
    await queryRunner.query(`DROP TABLE "contract"`);
  }
}
