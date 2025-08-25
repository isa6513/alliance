import { MigrationInterface, QueryRunner } from "typeorm";

export class Notifcascadedelete1756156176735 implements MigrationInterface {
    name = 'Notifcascadedelete1756156176735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP CONSTRAINT "FK_30a4322efaa2df30f9cfbdf7e5f"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD CONSTRAINT "FK_30a4322efaa2df30f9cfbdf7e5f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP CONSTRAINT "FK_30a4322efaa2df30f9cfbdf7e5f"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD CONSTRAINT "FK_30a4322efaa2df30f9cfbdf7e5f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
