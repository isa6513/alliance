import { MigrationInterface, QueryRunner } from "typeorm";

export class Cascadedeletepersonalreminders1761622703035 implements MigrationInterface {
    name = 'Cascadedeletepersonalreminders1761622703035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personal_action_reminder" DROP CONSTRAINT "FK_eb9ab174d0c4d33a14fc4f7dfa8"`);
        await queryRunner.query(`ALTER TABLE "personal_action_reminder" ADD CONSTRAINT "FK_eb9ab174d0c4d33a14fc4f7dfa8" FOREIGN KEY ("groupId") REFERENCES "reminder_group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personal_action_reminder" DROP CONSTRAINT "FK_eb9ab174d0c4d33a14fc4f7dfa8"`);
        await queryRunner.query(`ALTER TABLE "personal_action_reminder" ADD CONSTRAINT "FK_eb9ab174d0c4d33a14fc4f7dfa8" FOREIGN KEY ("groupId") REFERENCES "reminder_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
