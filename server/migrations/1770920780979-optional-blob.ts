import { MigrationInterface, QueryRunner } from "typeorm";

export class OptionalBlob1770920780979 implements MigrationInterface {
    name = 'OptionalBlob1770920780979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_log" ALTER COLUMN "blob" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_log" ALTER COLUMN "blob" SET NOT NULL`);
    }

}
