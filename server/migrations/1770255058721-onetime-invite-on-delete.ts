import { MigrationInterface, QueryRunner } from "typeorm";

export class OnetimeInviteOnDelete1770255058721 implements MigrationInterface {
    name = 'OnetimeInviteOnDelete1770255058721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onetime_invite" DROP CONSTRAINT "FK_e0efae2c92aa901b772a2e46bc8"`);
        await queryRunner.query(`ALTER TABLE "onetime_invite" ADD CONSTRAINT "FK_e0efae2c92aa901b772a2e46bc8" FOREIGN KEY ("invitingUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onetime_invite" DROP CONSTRAINT "FK_e0efae2c92aa901b772a2e46bc8"`);
        await queryRunner.query(`ALTER TABLE "onetime_invite" ADD CONSTRAINT "FK_e0efae2c92aa901b772a2e46bc8" FOREIGN KEY ("invitingUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
