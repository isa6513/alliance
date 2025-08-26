import { MigrationInterface, QueryRunner } from "typeorm";

export class NotifChanging1756249967023 implements MigrationInterface {
    name = 'NotifChanging1756249967023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP CONSTRAINT "FK_c92d52f3d1156922555a5d80b41"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "primaryNotificationChannel"`);
        await queryRunner.query(`DROP TYPE "public"."user_primarynotificationchannel_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "emailNotifsEnabled" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "textNotifsEnabled" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "pushNotifsEnabled" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD CONSTRAINT "FK_c92d52f3d1156922555a5d80b41" FOREIGN KEY ("actionEventId") REFERENCES "action_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP CONSTRAINT "FK_c92d52f3d1156922555a5d80b41"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "pushNotifsEnabled"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "textNotifsEnabled"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailNotifsEnabled"`);
        await queryRunner.query(`CREATE TYPE "public"."user_primarynotificationchannel_enum" AS ENUM('text', 'email', 'push')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "primaryNotificationChannel" "public"."user_primarynotificationchannel_enum" NOT NULL DEFAULT 'email'`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD CONSTRAINT "FK_c92d52f3d1156922555a5d80b41" FOREIGN KEY ("actionEventId") REFERENCES "action_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
