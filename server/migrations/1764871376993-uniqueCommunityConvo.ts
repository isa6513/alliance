import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueCommunityConvo1764871376993 implements MigrationInterface {
    name = 'UniqueCommunityConvo1764871376993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_cabc48e77be83f96838b9d394a1"`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "UQ_cabc48e77be83f96838b9d394a1" UNIQUE ("communityId")`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_cabc48e77be83f96838b9d394a1" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_cabc48e77be83f96838b9d394a1"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "UQ_cabc48e77be83f96838b9d394a1"`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_cabc48e77be83f96838b9d394a1" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
