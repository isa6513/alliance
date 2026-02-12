import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConversationPhotoUpdate1770939871631
  implements MigrationInterface
{
  name = 'ConversationPhotoUpdate1770939871631';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "conversation" c
            SET "photo" = com."photo"
            FROM "community" com
            WHERE c."communityId" = com."id"
        `);
  }

  public async down(): Promise<void> {}
}
