import { MigrationInterface, QueryRunner } from "typeorm";

export class NotifCommunityInvite1771449861992 implements MigrationInterface {
    name = 'NotifCommunityInvite1771449861992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ADD "communityInviteId" integer`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_a92a42a69c92dda464debc5ceeb" FOREIGN KEY ("communityInviteId") REFERENCES "community_invite"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_a92a42a69c92dda464debc5ceeb"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "communityInviteId"`);
    }

}
