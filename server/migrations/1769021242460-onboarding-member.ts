import { MigrationInterface, QueryRunner } from 'typeorm';

export class OnboardingMember1769021242460 implements MigrationInterface {
  name = 'OnboardingMember1769021242460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Existing rows should be false
    await queryRunner.query(
      `ALTER TABLE "user" ADD "inOnboardingPhase" boolean NOT NULL DEFAULT false`,
    );

    // 2) New rows should default to true
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "inOnboardingPhase" SET DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "inOnboardingPhase"`,
    );
  }
}
