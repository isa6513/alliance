import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateActionEventIndices1763578790124 implements MigrationInterface {
    name = 'CreateActionEventIndices1763578790124'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_6e446b5ec2f5b912fb6bfa1426" ON "action_event" ("actionId", "newStatus", "date") `);
        await queryRunner.query(`CREATE INDEX "IDX_b024b96d07ee747696b4377fe8" ON "action_event" ("actionId", "date") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b024b96d07ee747696b4377fe8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6e446b5ec2f5b912fb6bfa1426"`);
    }

}
