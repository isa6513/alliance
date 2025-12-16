import { MigrationInterface, QueryRunner } from "typeorm";

export class Squarethumbnail1765914669962 implements MigrationInterface {
    name = 'Squarethumbnail1765914669962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "squareThumbnailImage" character varying`);
        await queryRunner.query(`ALTER TABLE "action" ADD "squareThumbnailImageAlt" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "squareThumbnailImageAlt"`);
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "squareThumbnailImage"`);
    }

}
