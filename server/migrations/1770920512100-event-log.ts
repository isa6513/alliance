import { MigrationInterface, QueryRunner } from "typeorm";

export class EventLog1770920512100 implements MigrationInterface {
    name = 'EventLog1770920512100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."event_log_event_enum" AS ENUM('account_created', 'contract_signed', 'contract_suspended', 'sms_unsubscribe', 'sms_inbound', 'sms_failure', 'forum_action_autocomplete', 'action_comment')`);
        await queryRunner.query(`CREATE TABLE "event_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event" "public"."event_log_event_enum" NOT NULL, "message" character varying NOT NULL, "blob" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_d8ccd9b5b44828ea378dd37e691" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "event_log" ADD CONSTRAINT "FK_9f8b14e2906ffc001e00e3ae96f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_log" DROP CONSTRAINT "FK_9f8b14e2906ffc001e00e3ae96f"`);
        await queryRunner.query(`DROP TABLE "event_log"`);
        await queryRunner.query(`DROP TYPE "public"."event_log_event_enum"`);
    }

}
