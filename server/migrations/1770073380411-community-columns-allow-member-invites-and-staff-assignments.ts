import { MigrationInterface, QueryRunner } from "typeorm";

export class CommunityColumnsAllowMemberInvitesAndStaffAssignments1770073380411 implements MigrationInterface {
    name = 'CommunityColumnsAllowMemberInvitesAndStaffAssignments1770073380411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community" DROP CONSTRAINT "CHK_1283e98329417b7470357bc73d"`);
        await queryRunner.query(`ALTER TABLE "community" ADD "allowMemberInvites" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "community" ADD "allowStaffAssignments" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "community" ADD CONSTRAINT "chk_public_requires_staff_assignments" CHECK (("public" = false) OR ("allowStaffAssignments" = true))`);
        await queryRunner.query(`ALTER TABLE "community" ADD CONSTRAINT "chk_public_requires_member_invites" CHECK (("public" = false) OR ("allowMemberInvites" = true))`);
        await queryRunner.query(`ALTER TABLE "community" ADD CONSTRAINT "CHK_e3b803cade15a7f3393e73d015" CHECK (("public" = false AND "allowMemberInvites" = false AND "allowStaffAssignments" = false) OR ("maxCapacity" IS NOT NULL))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community" DROP CONSTRAINT "CHK_e3b803cade15a7f3393e73d015"`);
        await queryRunner.query(`ALTER TABLE "community" DROP CONSTRAINT "chk_public_requires_member_invites"`);
        await queryRunner.query(`ALTER TABLE "community" DROP CONSTRAINT "chk_public_requires_staff_assignments"`);
        await queryRunner.query(`ALTER TABLE "community" DROP COLUMN "allowStaffAssignments"`);
        await queryRunner.query(`ALTER TABLE "community" DROP COLUMN "allowMemberInvites"`);
        await queryRunner.query(`ALTER TABLE "community" ADD CONSTRAINT "CHK_1283e98329417b7470357bc73d" CHECK (((public = false) OR ("maxCapacity" IS NOT NULL)))`);
    }

}
