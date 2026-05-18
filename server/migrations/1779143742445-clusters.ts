import { MigrationInterface, QueryRunner } from "typeorm";

export class Clusters1779143742445 implements MigrationInterface {
    name = 'Clusters1779143742445'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cluster" ("id" SERIAL NOT NULL, "displayName" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b09d39b9491ce5cb1e8407761fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "clusterId" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_b46923371da5b84cdb80e2e6829" FOREIGN KEY ("clusterId") REFERENCES "cluster"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_b46923371da5b84cdb80e2e6829"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "clusterId"`);
        await queryRunner.query(`DROP TABLE "cluster"`);
    }

}
