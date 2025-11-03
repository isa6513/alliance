import { MigrationInterface, QueryRunner } from "typeorm";

export class Cascadeupdates1762195037248 implements MigrationInterface {
    name = 'Cascadeupdates1762195037248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_update" DROP CONSTRAINT "FK_6fc20f9c69f4283d5ef0c05d5ba"`);
        await queryRunner.query(`ALTER TABLE "action_update" ADD CONSTRAINT "FK_6fc20f9c69f4283d5ef0c05d5ba" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_update" DROP CONSTRAINT "FK_6fc20f9c69f4283d5ef0c05d5ba"`);
        await queryRunner.query(`ALTER TABLE "action_update" ADD CONSTRAINT "FK_6fc20f9c69f4283d5ef0c05d5ba" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
