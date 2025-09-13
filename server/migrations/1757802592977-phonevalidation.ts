import { MigrationInterface, QueryRunner } from "typeorm";

export class Phonevalidation1757802592977 implements MigrationInterface {
    name = 'Phonevalidation1757802592977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "phoneNumberVerified" TO "phoneNumberValidated"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "phoneNumberValidated" TO "phoneNumberVerified"`);
    }

}
