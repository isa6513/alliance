import { MigrationInterface, QueryRunner } from "typeorm";

export class VideoProcessingInfo1770833810039 implements MigrationInterface {
    name = 'VideoProcessingInfo1770833810039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" ADD "processingInfo" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "processingInfo"`);
    }

}
