import { MigrationInterface, QueryRunner } from "typeorm";

export class Welcomeemail1756513601882 implements MigrationInterface {
    name = 'Welcomeemail1756513601882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_adc492faf309ebf60ca6425e183"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "welcomeMailId" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_339e33707542cf7d38347f8169e" UNIQUE ("welcomeMailId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_adc492faf309ebf60ca6425e183" FOREIGN KEY ("referredById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_339e33707542cf7d38347f8169e" FOREIGN KEY ("welcomeMailId") REFERENCES "mail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_339e33707542cf7d38347f8169e"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_adc492faf309ebf60ca6425e183"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_339e33707542cf7d38347f8169e"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "welcomeMailId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_adc492faf309ebf60ca6425e183" FOREIGN KEY ("referredById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
