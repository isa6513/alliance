import { MigrationInterface, QueryRunner } from "typeorm";

export class Associateactioneventgroups1761672164441 implements MigrationInterface {
    name = 'Associateactioneventgroups1761672164441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP CONSTRAINT "FK_3b857834886ade769b6bee38ee6"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP COLUMN "allSent"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" RENAME COLUMN "actionEventId" TO "memberActionEventId"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD CONSTRAINT "FK_614f018df34e5573ccdd46425fd" FOREIGN KEY ("memberActionEventId") REFERENCES "action_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP CONSTRAINT "FK_614f018df34e5573ccdd46425fd"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" RENAME COLUMN "memberActionEventId" TO "actionEventId"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD "allSent" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD CONSTRAINT "FK_3b857834886ade769b6bee38ee6" FOREIGN KEY ("actionEventId") REFERENCES "action_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
