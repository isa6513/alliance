import { MigrationInterface, QueryRunner } from 'typeorm';

export class PendingCommunity1770252977160 implements MigrationInterface {
  name = 'PendingCommunity1770252977160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "referredByInviteId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_72d0238566c1c1611459d672d47" UNIQUE ("referredByInviteId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "pendingCommunityId" integer`,
    );

    // Update users whose latest contract event is suspended (or have no contract events)
    // Set pendingCommunityId to first non-leader community, and remove non-leader communities
    await queryRunner.query(`
            WITH users_to_update AS (
                -- Find users whose latest contract event is suspended or have no contract events
                SELECT DISTINCT u."id" as "userId"
                FROM "user" u
                LEFT JOIN LATERAL (
                    SELECT "type", "date"
                    FROM "contract_event" ce
                    WHERE ce."userId" = u."id"
                    ORDER BY ce."date" DESC
                    LIMIT 1
                ) latest_event ON true
                WHERE latest_event."type" = 'suspended' OR latest_event."type" IS NULL
            ),
            user_pending_communities AS (
                -- Find the first non-leader community for each user
                SELECT DISTINCT ON (cuu."userId") 
                    cuu."userId",
                    cuu."communityId" as "pendingCommunityId"
                FROM "community_users_user" cuu
                INNER JOIN users_to_update utu ON cuu."userId" = utu."userId"
                WHERE NOT EXISTS (
                    SELECT 1 
                    FROM "community_leaders_user" clu 
                    WHERE clu."userId" = cuu."userId" 
                    AND clu."communityId" = cuu."communityId"
                )
                ORDER BY cuu."userId", cuu."communityId"
            )
            -- Update pendingCommunityId
            UPDATE "user" u
            SET "pendingCommunityId" = upc."pendingCommunityId"
            FROM user_pending_communities upc
            WHERE u."id" = upc."userId"
        `);

    // Remove non-leader communities from community_users_user for suspended users
    await queryRunner.query(`
            DELETE FROM "community_users_user" cuu
            WHERE EXISTS (
                SELECT 1
                FROM "user" u
                LEFT JOIN LATERAL (
                    SELECT "type", "date"
                    FROM "contract_event" ce
                    WHERE ce."userId" = u."id"
                    ORDER BY ce."date" DESC
                    LIMIT 1
                ) latest_event ON true
                WHERE u."id" = cuu."userId"
                AND (latest_event."type" = 'suspended' OR latest_event."type" IS NULL)
            )
            AND NOT EXISTS (
                SELECT 1
                FROM "community_leaders_user" clu
                WHERE clu."userId" = cuu."userId"
                AND clu."communityId" = cuu."communityId"
            )
        `);

    await queryRunner.query(
      `ALTER TYPE "public"."notification_category_enum" RENAME TO "notification_category_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_category_enum" AS ENUM('action_event', 'forum_reply', 'friend_request', 'friend_request_accepted', 'action_update', 'likes', 'community_invite_created', 'community_invite_rejected', 'community_invite_accepted', 'removed_from_community', 'left_community_reminder', 'member_left_community', 'member_suspended_removed_from_community', 'member_joined_community', 'community_assigned', 'new_member_referred', 'onetime_invite_request_created', 'onetime_invite_request_approved', 'onetime_invite_request_rejected', 'community_invite_request_created', 'community_invite_request_rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "category" TYPE "public"."notification_category_enum" USING "category"::"text"::"public"."notification_category_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."notification_category_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_72d0238566c1c1611459d672d47" FOREIGN KEY ("referredByInviteId") REFERENCES "onetime_invite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_4789e1e3f6716141e9195c1e145" FOREIGN KEY ("pendingCommunityId") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_4789e1e3f6716141e9195c1e145"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_72d0238566c1c1611459d672d47"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_category_enum_old" AS ENUM('action_event', 'forum_reply', 'friend_request', 'friend_request_accepted', 'action_update', 'likes', 'community_invite_created', 'community_invite_rejected', 'community_invite_accepted', 'removed_from_community', 'left_community_reminder', 'member_left_community', 'member_joined_community', 'community_assigned', 'new_member_referred', 'onetime_invite_request_created', 'onetime_invite_request_approved', 'onetime_invite_request_rejected', 'community_invite_request_created', 'community_invite_request_rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "category" TYPE "public"."notification_category_enum_old" USING "category"::"text"::"public"."notification_category_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notification_category_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."notification_category_enum_old" RENAME TO "notification_category_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "pendingCommunityId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_72d0238566c1c1611459d672d47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "referredByInviteId"`,
    );
  }
}
