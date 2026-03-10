import { MigrationInterface, QueryRunner } from "typeorm";

export class Unreadcontent21773169288763 implements MigrationInterface {
    name = 'Unreadcontent21773169288763'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push" DROP CONSTRAINT "FK_26c7c04b4a77e15451d0402b98c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_unread_content_user_type_content"`);
        await queryRunner.query(`ALTER TABLE "push" DROP COLUMN "unreadContentId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push" ADD "unreadContentId" integer`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_unread_content_user_type_content" ON "unread_content" ("contentType", "contentId", "userId") `);
        await queryRunner.query(`ALTER TABLE "push" ADD CONSTRAINT "FK_26c7c04b4a77e15451d0402b98c" FOREIGN KEY ("unreadContentId") REFERENCES "unread_content"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
