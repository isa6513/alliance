import { MigrationInterface, QueryRunner } from "typeorm";

export class MailStatusEnum1775782866276 implements MigrationInterface {
    name = 'MailStatusEnum1775782866276'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."EmailStatus" AS ENUM('pending', 'sent', 'failed')`);
        await queryRunner.query(`ALTER TABLE "mail" ALTER COLUMN "status" TYPE "public"."EmailStatus" USING "status"::"public"."EmailStatus"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mail" ALTER COLUMN "status" TYPE character varying`);
        await queryRunner.query(`DROP TYPE "public"."EmailStatus"`);
    }

}
