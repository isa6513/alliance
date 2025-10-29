import { MigrationInterface, QueryRunner } from "typeorm";

export class Onetimeinvite1761700464697 implements MigrationInterface {
    name = 'Onetimeinvite1761700464697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "onetime_invite" ("id" SERIAL NOT NULL, "invitee" character varying NOT NULL, "code" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "isValid" boolean NOT NULL DEFAULT true, "invitingUserId" integer, CONSTRAINT "PK_889e0382dc8a6c738672e2e2110" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "onetime_invite" ADD CONSTRAINT "FK_e0efae2c92aa901b772a2e46bc8" FOREIGN KEY ("invitingUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onetime_invite" DROP CONSTRAINT "FK_e0efae2c92aa901b772a2e46bc8"`);
        await queryRunner.query(`DROP TABLE "onetime_invite"`);
    }

}
