import { MigrationInterface, QueryRunner } from "typeorm";

export class MmsOptout1770855231986 implements MigrationInterface {
    name = 'MmsOptout1770855231986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mms_optout" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phoneNumber" character varying NOT NULL, "reason" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "rawBody" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_3d7799080444db9b7fd8401a133" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "mms_optout" ADD CONSTRAINT "FK_3a18743d92584f7bd042704b3ba" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mms_optout" DROP CONSTRAINT "FK_3a18743d92584f7bd042704b3ba"`);
        await queryRunner.query(`DROP TABLE "mms_optout"`);
    }

}
