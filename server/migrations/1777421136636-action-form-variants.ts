import { MigrationInterface, QueryRunner } from "typeorm";

export class ActionFormVariants1777421136636 implements MigrationInterface {
    name = 'ActionFormVariants1777421136636'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "action_form_variant" ("id" SERIAL NOT NULL, "actionId" integer NOT NULL, "formId" integer NOT NULL, "name" text NOT NULL, "splitValue" double precision NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_action_form_variant_formId" UNIQUE ("formId"), CONSTRAINT "PK_f10945220316ec2b6ea40dce346" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_action_form_variant_actionId" ON "action_form_variant" ("actionId") `);
        await queryRunner.query(`CREATE TABLE "action_form_assignment" ("id" SERIAL NOT NULL, "actionId" integer NOT NULL, "userId" integer NOT NULL, "variantId" integer, "assignedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_action_form_assignment_actionId_userId" UNIQUE ("actionId", "userId"), CONSTRAINT "PK_6a5033d664b418c4abc3e744612" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_action_form_assignment_variantId" ON "action_form_assignment" ("variantId") `);
        await queryRunner.query(`ALTER TABLE "action_form_variant" ADD CONSTRAINT "FK_257a326e62ba85980b5423cf5f9" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_form_variant" ADD CONSTRAINT "FK_a20a894fd6e83f41e2ff73e9f93" FOREIGN KEY ("formId") REFERENCES "form"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_form_assignment" ADD CONSTRAINT "FK_a5832c89d828dfc3210a138e579" FOREIGN KEY ("actionId") REFERENCES "action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_form_assignment" ADD CONSTRAINT "FK_140ab17c1612da11f32a0b634f9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_form_assignment" ADD CONSTRAINT "FK_2352f9d3d1e0c993fedfdc27203" FOREIGN KEY ("variantId") REFERENCES "action_form_variant"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_form_assignment" DROP CONSTRAINT "FK_2352f9d3d1e0c993fedfdc27203"`);
        await queryRunner.query(`ALTER TABLE "action_form_assignment" DROP CONSTRAINT "FK_140ab17c1612da11f32a0b634f9"`);
        await queryRunner.query(`ALTER TABLE "action_form_assignment" DROP CONSTRAINT "FK_a5832c89d828dfc3210a138e579"`);
        await queryRunner.query(`ALTER TABLE "action_form_variant" DROP CONSTRAINT "FK_a20a894fd6e83f41e2ff73e9f93"`);
        await queryRunner.query(`ALTER TABLE "action_form_variant" DROP CONSTRAINT "FK_257a326e62ba85980b5423cf5f9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_action_form_assignment_variantId"`);
        await queryRunner.query(`DROP TABLE "action_form_assignment"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_action_form_variant_actionId"`);
        await queryRunner.query(`DROP TABLE "action_form_variant"`);
    }

}
