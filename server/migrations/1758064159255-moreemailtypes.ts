import { MigrationInterface, QueryRunner } from 'typeorm';

export class Moreemailtypes1758064159255 implements MigrationInterface {
  name = 'Moreemailtypes1758064159255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mail" RENAME COLUMN "emailType" TO "emailType_old"`,
    );

    // Create the new enum type
    await queryRunner.query(`
            CREATE TYPE "public"."EmailType" AS ENUM(
                'verification',
                'password_reset',
                'partial_signup',
                'welcome',
                'other',
                'commitment',
                'memberaction',
                'commitmentreminder',
                'memberactionreminder'
            )
        `);

    // Add the new enum column
    await queryRunner.query(
      `ALTER TABLE "mail" ADD COLUMN "emailType" "public"."EmailType"`,
    );

    // Copy over values where possible (only those that are valid enum values)
    await queryRunner.query(`
            UPDATE "mail"
            SET "emailType" = "emailType_old"::text::"public"."EmailType"
            WHERE "emailType_old" IN (
                'verification',
                'password_reset',
                'partial_signup',
                'welcome',
                'other',
                'commitment',
                'memberaction',
                'commitmentreminder',
                'memberactionreminder'
            )
        `);

    // If you want to handle invalid values explicitly, you could set them to a default like 'other':
    await queryRunner.query(`
            UPDATE "mail"
            SET "emailType" = 'other'
            WHERE "emailType" IS NULL
        `);

    // Make it not null
    await queryRunner.query(
      `ALTER TABLE "mail" ALTER COLUMN "emailType" SET NOT NULL`,
    );

    // Drop the old column
    await queryRunner.query(`ALTER TABLE "mail" DROP COLUMN "emailType_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mail" ADD COLUMN "emailType_old" text`,
    );

    // Copy enum values back as text
    await queryRunner.query(`
        UPDATE "mail"
        SET "emailType_old" = "emailType"::text
    `);

    // Drop the enum column and type
    await queryRunner.query(`ALTER TABLE "mail" DROP COLUMN "emailType"`);
    await queryRunner.query(`DROP TYPE "public"."EmailType"`);

    // Rename old text column back
    await queryRunner.query(
      `ALTER TABLE "mail" RENAME COLUMN "emailType_old" TO "emailType"`,
    );
  }
}
