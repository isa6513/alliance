import { MigrationInterface, QueryRunner } from "typeorm";

export class UserGroups1758764478356 implements MigrationInterface {
    name = 'UserGroups1758764478356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "group" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "publicDisplayName" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_users_user" ("groupId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_e075467711f75a7f49fb79c79ef" PRIMARY KEY ("groupId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fe6cce7d479552c17823e267af" ON "group_users_user" ("groupId") `);
        await queryRunner.query(`CREATE INDEX "IDX_55edea38fece215a3b66443a49" ON "group_users_user" ("userId") `);
        await queryRunner.query(`CREATE TABLE "group_participating_in_action" ("groupId" integer NOT NULL, "actionId" integer NOT NULL, CONSTRAINT "PK_58d69b0e23ec82c907a6bd306dd" PRIMARY KEY ("groupId", "actionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9731c5cf710ac09d1f5d7cc4aa" ON "group_participating_in_action" ("groupId") `);
        await queryRunner.query(`CREATE INDEX "IDX_97fd88ea4947706be1cf93095b" ON "group_participating_in_action" ("actionId") `);
        await queryRunner.query(`CREATE TABLE "action_participating_groups_group" ("actionId" integer NOT NULL, "groupId" integer NOT NULL, CONSTRAINT "PK_51d6e627aa19c844033f94f5ce5" PRIMARY KEY ("actionId", "groupId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_95ee61f695d6d1fad8a556b4c2" ON "action_participating_groups_group" ("actionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0615c89d8434c3259d7d1e74eb" ON "action_participating_groups_group" ("groupId") `);
        await queryRunner.query(`ALTER TABLE "group_users_user" ADD CONSTRAINT "FK_fe6cce7d479552c17823e267aff" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "group_users_user" ADD CONSTRAINT "FK_55edea38fece215a3b66443a498" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_participating_in_action" ADD CONSTRAINT "FK_9731c5cf710ac09d1f5d7cc4aa6" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "group_participating_in_action" ADD CONSTRAINT "FK_97fd88ea4947706be1cf93095b7" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_participating_groups_group" ADD CONSTRAINT "FK_95ee61f695d6d1fad8a556b4c21" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "action_participating_groups_group" ADD CONSTRAINT "FK_0615c89d8434c3259d7d1e74ebb" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_participating_groups_group" DROP CONSTRAINT "FK_0615c89d8434c3259d7d1e74ebb"`);
        await queryRunner.query(`ALTER TABLE "action_participating_groups_group" DROP CONSTRAINT "FK_95ee61f695d6d1fad8a556b4c21"`);
        await queryRunner.query(`ALTER TABLE "group_participating_in_action" DROP CONSTRAINT "FK_97fd88ea4947706be1cf93095b7"`);
        await queryRunner.query(`ALTER TABLE "group_participating_in_action" DROP CONSTRAINT "FK_9731c5cf710ac09d1f5d7cc4aa6"`);
        await queryRunner.query(`ALTER TABLE "group_users_user" DROP CONSTRAINT "FK_55edea38fece215a3b66443a498"`);
        await queryRunner.query(`ALTER TABLE "group_users_user" DROP CONSTRAINT "FK_fe6cce7d479552c17823e267aff"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0615c89d8434c3259d7d1e74eb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_95ee61f695d6d1fad8a556b4c2"`);
        await queryRunner.query(`DROP TABLE "action_participating_groups_group"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97fd88ea4947706be1cf93095b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9731c5cf710ac09d1f5d7cc4aa"`);
        await queryRunner.query(`DROP TABLE "group_participating_in_action"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55edea38fece215a3b66443a49"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe6cce7d479552c17823e267af"`);
        await queryRunner.query(`DROP TABLE "group_users_user"`);
        await queryRunner.query(`DROP TABLE "group"`);
    }

}
