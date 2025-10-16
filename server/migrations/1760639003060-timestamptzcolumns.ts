import { MigrationInterface, QueryRunner } from 'typeorm';

export class Timestamptzcolumns1760639003060 implements MigrationInterface {
  name = 'Timestamptzcolumns1760639003060';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_reminder" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );

    await queryRunner.query(
      'ALTER TABLE "mms" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "mms" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "editable_content" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "editable_content" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "form" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "form" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "action_reminder" ALTER COLUMN "sendAt" TYPE TIMESTAMP WITH TIME ZONE USING "sendAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "action_reminder" ALTER COLUMN "sentAt" TYPE TIMESTAMP WITH TIME ZONE USING "sentAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "action_event" ALTER COLUMN "date" TYPE TIMESTAMP WITH TIME ZONE USING "date" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "action_event" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "group" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "group" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "action" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "notification" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "notification" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "friend" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "friend" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "user" ALTER COLUMN "sentTextOptInMessageAt" TYPE TIMESTAMP WITH TIME ZONE USING "sentTextOptInMessageAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "user" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "user" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "image" ALTER COLUMN "dateCreated" TYPE TIMESTAMP WITH TIME ZONE USING "dateCreated" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "image" ALTER COLUMN "dateUpdated" TYPE TIMESTAMP WITH TIME ZONE USING "dateUpdated" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "post" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "post" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "post" ALTER COLUMN "visibleAt" TYPE TIMESTAMP WITH TIME ZONE USING "visibleAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "comment" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_reminder" DROP COLUMN "createdAt"`,
    );

    await queryRunner.query(
      'ALTER TABLE "mms" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "mms" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "editable_content" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "editable_content" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "form" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "form" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "action_reminder" ALTER COLUMN "sendAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "sendAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "action_reminder" ALTER COLUMN "sentAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "sentAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "action_event" ALTER COLUMN "date" TYPE TIMESTAMP WITHOUT TIME ZONE USING "date" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "action_event" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "group" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "group" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "action" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "notification" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "notification" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "friend" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "friend" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "user" ALTER COLUMN "sentTextOptInMessageAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "sentTextOptInMessageAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "user" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "user" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "image" ALTER COLUMN "dateCreated" TYPE TIMESTAMP WITHOUT TIME ZONE USING "dateCreated" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "image" ALTER COLUMN "dateUpdated" TYPE TIMESTAMP WITHOUT TIME ZONE USING "dateUpdated" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "post" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "createdAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "post" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );
    await queryRunner.query(
      'ALTER TABLE "post" ALTER COLUMN "visibleAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "visibleAt" AT TIME ZONE \'UTC\'',
    );

    await queryRunner.query(
      'ALTER TABLE "comment" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updatedAt" AT TIME ZONE \'UTC\'',
    );
  }
}
