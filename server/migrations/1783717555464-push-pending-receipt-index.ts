import { MigrationInterface, QueryRunner } from "typeorm";

export class PushPendingReceiptIndex1783717555464 implements MigrationInterface {
    name = 'PushPendingReceiptIndex1783717555464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_e0b29d666f8e4c54b7137c3a29" ON "push" ("createdAt") WHERE "receiptStatus" = 'pending' AND "receiptId" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e0b29d666f8e4c54b7137c3a29"`);
    }

}
