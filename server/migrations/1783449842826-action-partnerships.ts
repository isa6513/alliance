import { MigrationInterface, QueryRunner } from "typeorm";

export class ActionPartnerships1783449842826 implements MigrationInterface {
    name = 'ActionPartnerships1783449842826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "action_partnership_note" ("id" SERIAL NOT NULL, "noteDate" TIMESTAMP WITH TIME ZONE NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "responseId" integer NOT NULL, CONSTRAINT "PK_cdd6b0e3bd97bd346bb9740a5b8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "action_partnership_response" ("id" SERIAL NOT NULL, "organizationName" character varying NOT NULL, "personName" character varying NOT NULL, "contact" character varying NOT NULL, "outreachChannels" jsonb NOT NULL, "audienceSize" character varying NOT NULL, "desiredCollaboration" text NOT NULL, "notes" text NOT NULL DEFAULT '', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4d7c10e954376fd88cb4989c83b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "action_partnership_note" ADD CONSTRAINT "FK_eea31476766e9368474206e33d8" FOREIGN KEY ("responseId") REFERENCES "action_partnership_response"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_partnership_note" DROP CONSTRAINT "FK_eea31476766e9368474206e33d8"`);
        await queryRunner.query(`DROP TABLE "action_partnership_note"`);
        await queryRunner.query(`DROP TABLE "action_partnership_response"`);
    }

}
