import { MigrationInterface, QueryRunner } from "typeorm";

export class CommunityInvites1763066352415 implements MigrationInterface {
    name = 'CommunityInvites1763066352415'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."community_invite_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "community_invite" ("id" SERIAL NOT NULL, "status" "public"."community_invite_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "invitingUserId" integer, "invitedUserId" integer, "communityId" integer, CONSTRAINT "PK_3fa26c1d014add9faa6a191892b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "community_invite" ADD CONSTRAINT "FK_25a58fb069d7149e6c8660ec34d" FOREIGN KEY ("invitingUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community_invite" ADD CONSTRAINT "FK_a6d6065cedd23f74e7ca5976059" FOREIGN KEY ("invitedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community_invite" ADD CONSTRAINT "FK_a172473353c73e761ea78a3f658" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community_invite" DROP CONSTRAINT "FK_a172473353c73e761ea78a3f658"`);
        await queryRunner.query(`ALTER TABLE "community_invite" DROP CONSTRAINT "FK_a6d6065cedd23f74e7ca5976059"`);
        await queryRunner.query(`ALTER TABLE "community_invite" DROP CONSTRAINT "FK_25a58fb069d7149e6c8660ec34d"`);
        await queryRunner.query(`DROP TABLE "community_invite"`);
        await queryRunner.query(`DROP TYPE "public"."community_invite_status_enum"`);
    }

}
