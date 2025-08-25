import { MigrationInterface, QueryRunner } from "typeorm";

export class UserNotifs1756146150979 implements MigrationInterface {
    name = 'UserNotifs1756146150979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" DROP CONSTRAINT "FK_3600cba60926c01106e6818d693"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "phoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "phoneNumberVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "emailVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE TYPE "public"."user_primarynotificationchannel_enum" AS ENUM('text', 'email', 'push')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "primaryNotificationChannel" "public"."user_primarynotificationchannel_enum" NOT NULL DEFAULT 'email'`);
        await queryRunner.query(`CREATE TYPE "public"."user_socialnotifspreference_enum" AS ENUM('all', 'digest', 'none')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "socialNotifsPreference" "public"."user_socialnotifspreference_enum" NOT NULL DEFAULT 'all'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "turnedOffAllNotifs" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "form_response" ADD CONSTRAINT "FK_3600cba60926c01106e6818d693" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" DROP CONSTRAINT "FK_3600cba60926c01106e6818d693"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "turnedOffAllNotifs"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "socialNotifsPreference"`);
        await queryRunner.query(`DROP TYPE "public"."user_socialnotifspreference_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "primaryNotificationChannel"`);
        await queryRunner.query(`DROP TYPE "public"."user_primarynotificationchannel_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailVerified"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phoneNumberVerified"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "form_response" ADD CONSTRAINT "FK_3600cba60926c01106e6818d693" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
