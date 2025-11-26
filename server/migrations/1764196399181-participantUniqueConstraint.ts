import { MigrationInterface, QueryRunner } from "typeorm";

export class ParticipantUniqueConstraint1764196399181 implements MigrationInterface {
    name = 'ParticipantUniqueConstraint1764196399181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participant" ADD CONSTRAINT "UQ_3eb9345f4e759a2c536e69b9f6d" UNIQUE ("conversationId", "userId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participant" DROP CONSTRAINT "UQ_3eb9345f4e759a2c536e69b9f6d"`);
    }

}
