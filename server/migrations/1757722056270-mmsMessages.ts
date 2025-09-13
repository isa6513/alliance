import { MigrationInterface, QueryRunner } from "typeorm";

export class MmsMessages1757722056270 implements MigrationInterface {
    name = 'MmsMessages1757722056270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mms" ("id" SERIAL NOT NULL, "to" character varying NOT NULL, "from" character varying NOT NULL, "body" character varying NOT NULL, "status" character varying NOT NULL, "twilioSid" character varying NOT NULL, "errorCode" character varying, "errorMessage" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d51f82c22c8d7a4d4916beed70" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD "mmsId" integer`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD CONSTRAINT "UQ_15bced7e658d4169c0850e9ed4a" UNIQUE ("mmsId")`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD CONSTRAINT "FK_15bced7e658d4169c0850e9ed4a" FOREIGN KEY ("mmsId") REFERENCES "mms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP CONSTRAINT "FK_15bced7e658d4169c0850e9ed4a"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP CONSTRAINT "UQ_15bced7e658d4169c0850e9ed4a"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP COLUMN "mmsId"`);
        await queryRunner.query(`DROP TABLE "mms"`);
    }

}
