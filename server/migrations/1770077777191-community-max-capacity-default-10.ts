import { MigrationInterface, QueryRunner } from "typeorm";

export class CommunityMaxCapacityDefault101770077777191 implements MigrationInterface {
    name = 'CommunityMaxCapacityDefault101770077777191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community" ALTER COLUMN "maxCapacity" SET DEFAULT '10'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community" ALTER COLUMN "maxCapacity" DROP DEFAULT`);
    }

}
