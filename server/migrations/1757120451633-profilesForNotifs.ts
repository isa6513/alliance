import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProfilesForNotifs1757120451633 implements MigrationInterface {
  name = 'ProfilesForNotifs1757120451633';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_3af9e645be42ee1aec1a10dc7be" FOREIGN KEY ("associatedUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_3af9e645be42ee1aec1a10dc7be"`,
    );
  }
}
