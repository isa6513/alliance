import { MigrationInterface, QueryRunner } from "typeorm";

export class Notifgrouping1762972600442 implements MigrationInterface {
    name = 'Notifgrouping1762972600442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ADD "groupingKey" character varying`);
        await queryRunner.query(`ALTER TYPE "public"."notification_category_enum" RENAME TO "notification_category_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_category_enum" AS ENUM('action_event', 'forum_reply', 'friend_request', 'friend_request_accepted', 'action_update', 'likes')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "category" TYPE "public"."notification_category_enum" USING "category"::"text"::"public"."notification_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_category_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_category_enum_old" AS ENUM('action_event', 'forum_reply', 'friend_request', 'friend_request_accepted', 'action_update')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "category" TYPE "public"."notification_category_enum_old" USING "category"::"text"::"public"."notification_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notification_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notification_category_enum_old" RENAME TO "notification_category_enum"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "groupingKey"`);
    }

}
