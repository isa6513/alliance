import { MigrationInterface, QueryRunner } from "typeorm";

export class CommunityInviteCascade1770748521462 implements MigrationInterface {
    name = 'CommunityInviteCascade1770748521462'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community_invite" DROP CONSTRAINT "FK_25a58fb069d7149e6c8660ec34d"`);
        await queryRunner.query(`ALTER TABLE "community_invite" DROP CONSTRAINT "FK_a6d6065cedd23f74e7ca5976059"`);
        await queryRunner.query(`ALTER TABLE "community_invite" ADD CONSTRAINT "FK_25a58fb069d7149e6c8660ec34d" FOREIGN KEY ("invitingUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community_invite" ADD CONSTRAINT "FK_a6d6065cedd23f74e7ca5976059" FOREIGN KEY ("invitedUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community_invite" DROP CONSTRAINT "FK_a6d6065cedd23f74e7ca5976059"`);
        await queryRunner.query(`ALTER TABLE "community_invite" DROP CONSTRAINT "FK_25a58fb069d7149e6c8660ec34d"`);
        await queryRunner.query(`ALTER TABLE "community_invite" ADD CONSTRAINT "FK_a6d6065cedd23f74e7ca5976059" FOREIGN KEY ("invitedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community_invite" ADD CONSTRAINT "FK_25a58fb069d7149e6c8660ec34d" FOREIGN KEY ("invitingUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
