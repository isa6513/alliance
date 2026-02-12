import { MigrationInterface, QueryRunner } from "typeorm";

export class TrackTwilioUnsub1770852711416 implements MigrationInterface {
    name = 'TrackTwilioUnsub1770852711416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "phoneNumberUnsubscribed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phoneNumberUnsubscribed"`);
    }

}
