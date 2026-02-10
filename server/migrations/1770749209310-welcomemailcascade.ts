import { MigrationInterface, QueryRunner } from "typeorm";

export class Welcomemailcascade1770749209310 implements MigrationInterface {
    name = 'Welcomemailcascade1770749209310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_339e33707542cf7d38347f8169e"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_339e33707542cf7d38347f8169e" FOREIGN KEY ("welcomeMailId") REFERENCES "mail"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_339e33707542cf7d38347f8169e"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_339e33707542cf7d38347f8169e" FOREIGN KEY ("welcomeMailId") REFERENCES "mail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
