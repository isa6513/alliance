import { MigrationInterface, QueryRunner } from "typeorm";

export class Communities1762477997440 implements MigrationInterface {
    name = 'Communities1762477997440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "community" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "photo" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cae794115a383328e8923de4193" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "community_users_user" ("communityId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_de24dfe0468b0f2a59b548e4508" PRIMARY KEY ("communityId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c85556b8f7e06191ed32c7d0f1" ON "community_users_user" ("communityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1b6e13ef0e9174962dea4be254" ON "community_users_user" ("userId") `);
        await queryRunner.query(`CREATE TABLE "community_leaders_user" ("communityId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_aeaa152ce211bb0210b6655ff43" PRIMARY KEY ("communityId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ada19ab2e4c07d694de5df043a" ON "community_leaders_user" ("communityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b162d4fb5dcbe59d7032dc465b" ON "community_leaders_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "onetime_invite" ADD "communityId" integer`);
        await queryRunner.query(`ALTER TABLE "onetime_invite" ADD CONSTRAINT "FK_e6e907fcc20d0bae0b230397076" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community_users_user" ADD CONSTRAINT "FK_c85556b8f7e06191ed32c7d0f1a" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "community_users_user" ADD CONSTRAINT "FK_1b6e13ef0e9174962dea4be2545" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community_leaders_user" ADD CONSTRAINT "FK_ada19ab2e4c07d694de5df043af" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "community_leaders_user" ADD CONSTRAINT "FK_b162d4fb5dcbe59d7032dc465b3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community_leaders_user" DROP CONSTRAINT "FK_b162d4fb5dcbe59d7032dc465b3"`);
        await queryRunner.query(`ALTER TABLE "community_leaders_user" DROP CONSTRAINT "FK_ada19ab2e4c07d694de5df043af"`);
        await queryRunner.query(`ALTER TABLE "community_users_user" DROP CONSTRAINT "FK_1b6e13ef0e9174962dea4be2545"`);
        await queryRunner.query(`ALTER TABLE "community_users_user" DROP CONSTRAINT "FK_c85556b8f7e06191ed32c7d0f1a"`);
        await queryRunner.query(`ALTER TABLE "onetime_invite" DROP CONSTRAINT "FK_e6e907fcc20d0bae0b230397076"`);
        await queryRunner.query(`ALTER TABLE "onetime_invite" DROP COLUMN "communityId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b162d4fb5dcbe59d7032dc465b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ada19ab2e4c07d694de5df043a"`);
        await queryRunner.query(`DROP TABLE "community_leaders_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1b6e13ef0e9174962dea4be254"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c85556b8f7e06191ed32c7d0f1"`);
        await queryRunner.query(`DROP TABLE "community_users_user"`);
        await queryRunner.query(`DROP TABLE "community"`);
    }

}
