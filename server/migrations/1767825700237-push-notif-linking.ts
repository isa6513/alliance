import { MigrationInterface, QueryRunner } from "typeorm";

export class PushNotifLinking1767825700237 implements MigrationInterface {
    name = 'PushNotifLinking1767825700237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_9ff56e2bb31458f2f5171e46fee"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "UQ_9ff56e2bb31458f2f5171e46fee"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "pushId"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "shouldPush" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "pushDispatchedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "push" ADD "notificationId" integer`);
        await queryRunner.query(`ALTER TABLE "push" ADD CONSTRAINT "FK_8daafc4efe487397000cb943012" FOREIGN KEY ("notificationId") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push" DROP CONSTRAINT "FK_8daafc4efe487397000cb943012"`);
        await queryRunner.query(`ALTER TABLE "push" DROP COLUMN "notificationId"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "pushDispatchedAt"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "shouldPush"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "pushId" integer`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "UQ_9ff56e2bb31458f2f5171e46fee" UNIQUE ("pushId")`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_9ff56e2bb31458f2f5171e46fee" FOREIGN KEY ("pushId") REFERENCES "push"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
