import { MigrationInterface, QueryRunner } from "typeorm";

export class Gr1761072119094 implements MigrationInterface {
    name = 'Gr1761072119094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_users_user" DROP CONSTRAINT "FK_55edea38fece215a3b66443a498"`);
        await queryRunner.query(`ALTER TABLE "group_participating_in_action" DROP CONSTRAINT "FK_97fd88ea4947706be1cf93095b7"`);
        await queryRunner.query(`ALTER TABLE "group_users_user" ADD CONSTRAINT "FK_55edea38fece215a3b66443a498" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_participating_in_action" ADD CONSTRAINT "FK_97fd88ea4947706be1cf93095b7" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_participating_in_action" DROP CONSTRAINT "FK_97fd88ea4947706be1cf93095b7"`);
        await queryRunner.query(`ALTER TABLE "group_users_user" DROP CONSTRAINT "FK_55edea38fece215a3b66443a498"`);
        await queryRunner.query(`ALTER TABLE "group_participating_in_action" ADD CONSTRAINT "FK_97fd88ea4947706be1cf93095b7" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_users_user" ADD CONSTRAINT "FK_55edea38fece215a3b66443a498" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
