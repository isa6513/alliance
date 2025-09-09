import { MigrationInterface, QueryRunner } from "typeorm";

export class Declinemorality1757387410265 implements MigrationInterface {
    name = 'Declinemorality1757387410265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_activity" ADD "isMoral" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_activity" DROP COLUMN "isMoral"`);
    }

}
