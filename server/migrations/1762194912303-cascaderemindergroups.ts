import { MigrationInterface, QueryRunner } from "typeorm";

export class Cascaderemindergroups1762194912303 implements MigrationInterface {
    name = 'Cascaderemindergroups1762194912303'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP CONSTRAINT "FK_614f018df34e5573ccdd46425fd"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD CONSTRAINT "FK_614f018df34e5573ccdd46425fd" FOREIGN KEY ("memberActionEventId") REFERENCES "action_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminder_group" DROP CONSTRAINT "FK_614f018df34e5573ccdd46425fd"`);
        await queryRunner.query(`ALTER TABLE "reminder_group" ADD CONSTRAINT "FK_614f018df34e5573ccdd46425fd" FOREIGN KEY ("memberActionEventId") REFERENCES "action_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
