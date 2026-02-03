import { MigrationInterface, QueryRunner } from "typeorm";

export class NotifPrioset1770158027915 implements MigrationInterface {


    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          UPDATE "notification"
          SET "priority" = 'high'
          WHERE "category" = 'action_update';
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        // revert them back to low priority — safest reversible behavior
        await queryRunner.query(`
          UPDATE "notification"
          SET "priority" = 'low'
          WHERE "category" = 'action_update';
        `);
      }
    
}
