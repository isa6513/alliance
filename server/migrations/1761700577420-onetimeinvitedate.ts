import { MigrationInterface, QueryRunner } from "typeorm";

export class Onetimeinvitedate1761700577420 implements MigrationInterface {
    name = 'Onetimeinvitedate1761700577420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onetime_invite" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "onetime_invite" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onetime_invite" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "onetime_invite" ADD "createdAt" TIMESTAMP NOT NULL`);
    }

}
