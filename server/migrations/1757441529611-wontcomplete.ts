import { MigrationInterface, QueryRunner } from "typeorm";

export class Wontcomplete1757441529611 implements MigrationInterface {
    name = 'Wontcomplete1757441529611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."action_activity_type_enum" RENAME TO "action_activity_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."action_activity_type_enum" AS ENUM('user_joined', 'user_completed', 'user_declined', 'user_wont_complete')`);
        await queryRunner.query(`ALTER TABLE "action_activity" ALTER COLUMN "type" TYPE "public"."action_activity_type_enum" USING "type"::"text"::"public"."action_activity_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."action_activity_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."action_activity_type_enum_old" AS ENUM('user_joined', 'user_completed', 'user_declined')`);
        await queryRunner.query(`ALTER TABLE "action_activity" ALTER COLUMN "type" TYPE "public"."action_activity_type_enum_old" USING "type"::"text"::"public"."action_activity_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."action_activity_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."action_activity_type_enum_old" RENAME TO "action_activity_type_enum"`);
    }

}
