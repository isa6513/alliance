import { MigrationInterface, QueryRunner } from "typeorm";

export class PushNotifEntities1767814942035 implements MigrationInterface {
    name = 'PushNotifEntities1767814942035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "push" ("id" SERIAL NOT NULL, "expoPushToken" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "body" character varying NOT NULL, "screen" character varying, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "receiptId" character varying, "ticketStatus" character varying, "receiptStatus" character varying, "errorCode" character varying, "errorMessage" character varying, CONSTRAINT "PK_ddc3812b04a238cbf8606c12ea6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD "pushId" integer`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD CONSTRAINT "UQ_5b1c4d66c7751efbb20de60096a" UNIQUE ("pushId")`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "pushId" integer`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "UQ_9ff56e2bb31458f2f5171e46fee" UNIQUE ("pushId")`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD CONSTRAINT "FK_5b1c4d66c7751efbb20de60096a" FOREIGN KEY ("pushId") REFERENCES "push"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_9ff56e2bb31458f2f5171e46fee" FOREIGN KEY ("pushId") REFERENCES "push"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_9ff56e2bb31458f2f5171e46fee"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP CONSTRAINT "FK_5b1c4d66c7751efbb20de60096a"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "UQ_9ff56e2bb31458f2f5171e46fee"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "pushId"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP CONSTRAINT "UQ_5b1c4d66c7751efbb20de60096a"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP COLUMN "pushId"`);
        await queryRunner.query(`DROP TABLE "push"`);
    }

}
