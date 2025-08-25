import { MigrationInterface, QueryRunner } from "typeorm";

export class Actioneventnotifs1756152249064 implements MigrationInterface {
    name = 'Actioneventnotifs1756152249064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."NotificationChannel" AS ENUM('text', 'email', 'push')`);
        await queryRunner.query(`CREATE TABLE "action_event_notif" ("id" SERIAL NOT NULL, "channel" "public"."NotificationChannel" NOT NULL, "sent" boolean NOT NULL DEFAULT false, "actionEventId" integer, "mailId" integer, "userId" integer, CONSTRAINT "REL_fd6ab11e416542ef85262fac56" UNIQUE ("mailId"), CONSTRAINT "PK_ff0e162aa47ae9c99bba51bcb61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD CONSTRAINT "FK_c92d52f3d1156922555a5d80b41" FOREIGN KEY ("actionEventId") REFERENCES "action_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD CONSTRAINT "FK_fd6ab11e416542ef85262fac56b" FOREIGN KEY ("mailId") REFERENCES "mail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" ADD CONSTRAINT "FK_30a4322efaa2df30f9cfbdf7e5f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP CONSTRAINT "FK_30a4322efaa2df30f9cfbdf7e5f"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP CONSTRAINT "FK_fd6ab11e416542ef85262fac56b"`);
        await queryRunner.query(`ALTER TABLE "action_event_notif" DROP CONSTRAINT "FK_c92d52f3d1156922555a5d80b41"`);
        await queryRunner.query(`DROP TABLE "action_event_notif"`);
        await queryRunner.query(`DROP TYPE "public"."NotificationChannel"`);
    }

}
