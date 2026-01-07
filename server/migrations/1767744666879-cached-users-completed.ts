import { MigrationInterface, QueryRunner } from "typeorm";

export class CachedUsersCompleted1767744666879 implements MigrationInterface {
    name = 'CachedUsersCompleted1767744666879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" ADD "usersCompleted" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action" DROP COLUMN "usersCompleted"`);
    }

}
