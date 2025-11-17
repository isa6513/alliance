import { MigrationInterface, QueryRunner } from "typeorm";

export class CommentsInNotifEntity1763421787617 implements MigrationInterface {
    name = 'CommentsInNotifEntity1763421787617'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_1844cb17134d11dae608e2e209f"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "REL_1844cb17134d11dae608e2e209"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "notificationId"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "commentId" integer`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_8dcb425fddadd878d80bf5fa195" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_8dcb425fddadd878d80bf5fa195"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "commentId"`);
        await queryRunner.query(`ALTER TABLE "comment" ADD "notificationId" integer`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "REL_1844cb17134d11dae608e2e209" UNIQUE ("notificationId")`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_1844cb17134d11dae608e2e209f" FOREIGN KEY ("notificationId") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
