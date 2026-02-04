import { MigrationInterface, QueryRunner } from "typeorm";

export class NotifCategoryNewMemberReferred1770165396360 implements MigrationInterface {
    name = 'NotifCategoryNewMemberReferred1770165396360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."notification_category_enum" RENAME TO "notification_category_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_category_enum" AS ENUM('action_event', 'forum_reply', 'friend_request', 'friend_request_accepted', 'action_update', 'likes', 'community_invite_created', 'community_invite_rejected', 'community_invite_accepted', 'removed_from_community', 'left_community_reminder', 'member_left_community', 'member_joined_community', 'community_assigned', 'new_member_referred', 'onetime_invite_request_created', 'onetime_invite_request_approved', 'onetime_invite_request_rejected', 'community_invite_request_created', 'community_invite_request_rejected')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "category" TYPE "public"."notification_category_enum" USING "category"::"text"::"public"."notification_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_category_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."ActionEventNotifType" RENAME TO "ActionEventNotifType_old"`);
        await queryRunner.query(`CREATE TYPE "public"."ActionEventNotifType" AS ENUM('announcement', 'misseddeadline', 'reminder', 'personalreminder')`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" TYPE "public"."ActionEventNotifType" USING "type"::"text"::"public"."ActionEventNotifType"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" SET DEFAULT 'announcement'`);
        await queryRunner.query(`DROP TYPE "public"."ActionEventNotifType_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ActionEventNotifType_old" AS ENUM('announcement', 'misseddeadline', 'reminder', 'personalreminder', 'group_leads_with_incomplete')`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" TYPE "public"."ActionEventNotifType_old" USING "type"::"text"::"public"."ActionEventNotifType_old"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ALTER COLUMN "type" SET DEFAULT 'announcement'`);
        await queryRunner.query(`DROP TYPE "public"."ActionEventNotifType"`);
        await queryRunner.query(`ALTER TYPE "public"."ActionEventNotifType_old" RENAME TO "ActionEventNotifType"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_category_enum_old" AS ENUM('action_event', 'forum_reply', 'friend_request', 'friend_request_accepted', 'action_update', 'likes', 'community_invite_created', 'community_invite_rejected', 'community_invite_accepted', 'removed_from_community', 'left_community_reminder', 'member_left_community', 'member_joined_community', 'community_assigned', 'onetime_invite_request_created', 'onetime_invite_request_approved', 'onetime_invite_request_rejected', 'community_invite_request_created', 'community_invite_request_rejected')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "category" TYPE "public"."notification_category_enum_old" USING "category"::"text"::"public"."notification_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notification_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notification_category_enum_old" RENAME TO "notification_category_enum"`);
    }

}
