import { MigrationInterface, QueryRunner } from "typeorm";

export class VideoEntity1770775996603 implements MigrationInterface {
    name = 'VideoEntity1770775996603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "video" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "originalFilename" character varying NOT NULL, "mime" character varying NOT NULL, "size" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'processing', "duration" double precision, "dateCreated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "dateUpdated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "video"`);
    }

}
