import { MigrationInterface, QueryRunner } from "typeorm";

export class PreferredChannel1762389130370 implements MigrationInterface {
    name = 'PreferredChannel1762389130370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_preferredactionreminderchannel_enum" AS ENUM('text', 'email', 'push')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "preferredActionReminderChannel" "public"."user_preferredactionreminderchannel_enum" NOT NULL DEFAULT 'text'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "preferredActionReminderChannel"`);
        await queryRunner.query(`DROP TYPE "public"."user_preferredactionreminderchannel_enum"`);
    }

}
