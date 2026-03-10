import { MigrationInterface, QueryRunner } from "typeorm";

export class Contentid1773178420649 implements MigrationInterface {
    name = 'Contentid1773178420649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push" ADD "unreadContentId" integer`);
        await queryRunner.query(`ALTER TABLE "push" ADD CONSTRAINT "FK_26c7c04b4a77e15451d0402b98c" FOREIGN KEY ("unreadContentId") REFERENCES "unread_content"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push" DROP CONSTRAINT "FK_26c7c04b4a77e15451d0402b98c"`);
        await queryRunner.query(`ALTER TABLE "push" DROP COLUMN "unreadContentId"`);
    }

}
