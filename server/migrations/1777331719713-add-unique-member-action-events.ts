import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueMemberActionEvents1777331719713 implements MigrationInterface {
    name = 'AddUniqueMemberActionEvents1777331719713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_action_event_one_member_action" ON "action_event" ("actionId") WHERE "newStatus" = 'member_action'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_action_event_one_member_action"`);
    }

}
