import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowMessageDelete1770748416129 implements MigrationInterface {
    name = 'AllowMessageDelete1770748416129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participant" DROP CONSTRAINT "FK_455f31ed76f79d7578833407d2d"`);
        await queryRunner.query(`ALTER TABLE "participant" ADD CONSTRAINT "FK_455f31ed76f79d7578833407d2d" FOREIGN KEY ("lastReadMessageId") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participant" DROP CONSTRAINT "FK_455f31ed76f79d7578833407d2d"`);
        await queryRunner.query(`ALTER TABLE "participant" ADD CONSTRAINT "FK_455f31ed76f79d7578833407d2d" FOREIGN KEY ("lastReadMessageId") REFERENCES "message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
