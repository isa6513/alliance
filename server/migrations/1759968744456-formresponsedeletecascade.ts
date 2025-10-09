import { MigrationInterface, QueryRunner } from "typeorm";

export class Formresponsedeletecascade1759968744456 implements MigrationInterface {
    name = 'Formresponsedeletecascade1759968744456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" DROP CONSTRAINT "FK_3600cba60926c01106e6818d693"`);
        await queryRunner.query(`ALTER TABLE "form_response" ADD CONSTRAINT "FK_3600cba60926c01106e6818d693" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_response" DROP CONSTRAINT "FK_3600cba60926c01106e6818d693"`);
        await queryRunner.query(`ALTER TABLE "form_response" ADD CONSTRAINT "FK_3600cba60926c01106e6818d693" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
