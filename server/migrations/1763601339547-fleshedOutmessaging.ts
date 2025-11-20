import { MigrationInterface, QueryRunner } from "typeorm";

export class FleshedOutmessaging1763601339547 implements MigrationInterface {
    name = 'FleshedOutmessaging1763601339547'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ParticipantRole" AS ENUM('admin', 'member', 'owner')`);
        await queryRunner.query(`CREATE TYPE "public"."ParticipantState" AS ENUM('invited', 'joined')`);
        await queryRunner.query(`CREATE TABLE "participant" ("id" SERIAL NOT NULL, "role" "public"."ParticipantRole" NOT NULL, "state" "public"."ParticipantState" NOT NULL DEFAULT 'joined', "joinedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "conversationId" integer, "userId" integer, "lastReadMessageId" uuid, CONSTRAINT "PK_64da4237f502041781ca15d4c41" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE TYPE "public"."ConversationType" AS ENUM('direct', 'multiple', 'community')`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD "type" "public"."ConversationType" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD "photo" character varying`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD "communityId" integer`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "CHK_1732f98a11baec912cf67f5787" CHECK (("type" = 'direct' AND "communityId" IS NULL) OR ("type" = 'multiple' AND "communityId" IS NULL) OR ("type" = 'community' AND "communityId" IS NOT NULL))`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_cabc48e77be83f96838b9d394a1" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participant" ADD CONSTRAINT "FK_c03594530101ba8d1cf05bb137b" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participant" ADD CONSTRAINT "FK_b915e97dea27ffd1e40c8003b3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participant" ADD CONSTRAINT "FK_455f31ed76f79d7578833407d2d" FOREIGN KEY ("lastReadMessageId") REFERENCES "message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participant" DROP CONSTRAINT "FK_455f31ed76f79d7578833407d2d"`);
        await queryRunner.query(`ALTER TABLE "participant" DROP CONSTRAINT "FK_b915e97dea27ffd1e40c8003b3b"`);
        await queryRunner.query(`ALTER TABLE "participant" DROP CONSTRAINT "FK_c03594530101ba8d1cf05bb137b"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_cabc48e77be83f96838b9d394a1"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "CHK_1732f98a11baec912cf67f5787"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "communityId"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "photo"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."ConversationType"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`DROP TABLE "participant"`);
        await queryRunner.query(`DROP TYPE "public"."ParticipantState"`);
        await queryRunner.query(`DROP TYPE "public"."ParticipantRole"`);
    }

}
