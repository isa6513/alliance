import { MigrationInterface, QueryRunner } from "typeorm";

export class UserCitySetNull1766192324518 implements MigrationInterface {
    name = 'UserCitySetNull1766192324518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_beb5846554bec348f6baf449e83"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_beb5846554bec348f6baf449e83" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_beb5846554bec348f6baf449e83"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_beb5846554bec348f6baf449e83" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
