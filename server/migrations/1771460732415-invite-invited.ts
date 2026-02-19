import { MigrationInterface, QueryRunner } from "typeorm";

export class InviteInvited1771460732415 implements MigrationInterface {
    name = 'InviteInvited1771460732415'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onetime_invite" ADD "invitedUserId" integer`);
        await queryRunner.query(`ALTER TABLE "onetime_invite" ADD CONSTRAINT "UQ_76ceb8af242035ae76ec04092cb" UNIQUE ("invitedUserId")`);
        await queryRunner.query(`ALTER TABLE "onetime_invite" ADD CONSTRAINT "FK_76ceb8af242035ae76ec04092cb" FOREIGN KEY ("invitedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onetime_invite" DROP CONSTRAINT "FK_76ceb8af242035ae76ec04092cb"`);
        await queryRunner.query(`ALTER TABLE "onetime_invite" DROP CONSTRAINT "UQ_76ceb8af242035ae76ec04092cb"`);
        await queryRunner.query(`ALTER TABLE "onetime_invite" DROP COLUMN "invitedUserId"`);
    }

}
