import { createHash } from 'crypto';
import jsonStableStringify from 'json-stable-stringify';
import { MigrationInterface, QueryRunner } from 'typeorm';

// Match FormSnapshotService.hashFormSchema. Inlined here so the migration
// has no runtime dependency on application code.
function hashSchema(schema: Record<string, unknown>): string {
  return createHash('sha256')
    .update(jsonStableStringify(schema) ?? '')
    .digest('hex');
}

export class FormSnapshot1777328934057 implements MigrationInterface {
  name = 'FormSnapshot1777328934057';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the immutable form_snapshot table. hash is a sha256 of the
    //    json-stable-stringify of schema, computed in app code on insert,
    //    with a UNIQUE btree so dedup is enforced at the DB level.
    await queryRunner.query(
      `CREATE TABLE "form_snapshot" (
        "id" SERIAL NOT NULL,
        "schema" jsonb NOT NULL,
        "hash" text NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ee3fa94383a400c2d3bac2321b6" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_form_snapshot_hash" ON "form_snapshot" ("hash")`,
    );

    // 2. Add formSnapshotId on form and form_response (nullable so we can
    //    backfill before enforcing NOT NULL).
    await queryRunner.query(
      `ALTER TABLE "form" ADD COLUMN "formSnapshotId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_response" ADD COLUMN "formSnapshotId" integer`,
    );

    // 3. Backfill in JS: read every existing schema, compute its stable
    //    hash, dedupe, then insert into form_snapshot and assign
    //    formSnapshotId by hash on form / form_response.
    const formRows: { id: number; schema: Record<string, unknown> }[] =
      await queryRunner.query(`SELECT "id", "schema" FROM "form"`);
    const responseRows: {
      id: number;
      schemaSnapshot: Record<string, unknown>;
    }[] = await queryRunner.query(
      `SELECT "id", "schemaSnapshot" FROM "form_response"`,
    );

    const hashToSchema = new Map<string, Record<string, unknown>>();
    const formIdToHash = new Map<number, string>();
    const responseIdToHash = new Map<number, string>();

    for (const row of formRows) {
      const h = hashSchema(row.schema);
      formIdToHash.set(row.id, h);
      if (!hashToSchema.has(h)) hashToSchema.set(h, row.schema);
    }
    for (const row of responseRows) {
      const h = hashSchema(row.schemaSnapshot);
      responseIdToHash.set(row.id, h);
      if (!hashToSchema.has(h)) hashToSchema.set(h, row.schemaSnapshot);
    }

    for (const [h, schema] of hashToSchema) {
      await queryRunner.query(
        `INSERT INTO "form_snapshot" ("schema", "hash") VALUES ($1::jsonb, $2)
         ON CONFLICT ("hash") DO NOTHING`,
        [JSON.stringify(schema), h],
      );
    }

    // Stage (id, hash) pairs in temp tables so the snapshot lookup happens
    // in a single SQL UPDATE per source table instead of one round-trip
    // per row.
    if (formIdToHash.size > 0) {
      await queryRunner.query(
        `CREATE TEMP TABLE "_form_hash" ("formId" integer NOT NULL, "hash" text NOT NULL) ON COMMIT DROP`,
      );
      const formValues: string[] = [];
      const formParams: unknown[] = [];
      let i = 1;
      for (const [formId, h] of formIdToHash) {
        formValues.push(`($${i++}::integer, $${i++}::text)`);
        formParams.push(formId, h);
      }
      await queryRunner.query(
        `INSERT INTO "_form_hash" ("formId", "hash") VALUES ${formValues.join(', ')}`,
        formParams,
      );
      await queryRunner.query(`
        UPDATE "form" f
        SET "formSnapshotId" = s."id"
        FROM "_form_hash" m
        JOIN "form_snapshot" s ON s."hash" = m."hash"
        WHERE f."id" = m."formId"
      `);
    }

    if (responseIdToHash.size > 0) {
      await queryRunner.query(
        `CREATE TEMP TABLE "_response_hash" ("responseId" integer NOT NULL, "hash" text NOT NULL) ON COMMIT DROP`,
      );
      const responseValues: string[] = [];
      const responseParams: unknown[] = [];
      let i = 1;
      for (const [responseId, h] of responseIdToHash) {
        responseValues.push(`($${i++}::integer, $${i++}::text)`);
        responseParams.push(responseId, h);
      }
      await queryRunner.query(
        `INSERT INTO "_response_hash" ("responseId", "hash") VALUES ${responseValues.join(', ')}`,
        responseParams,
      );
      await queryRunner.query(`
        UPDATE "form_response" fr
        SET "formSnapshotId" = s."id"
        FROM "_response_hash" m
        JOIN "form_snapshot" s ON s."hash" = m."hash"
        WHERE fr."id" = m."responseId"
      `);
    }

    // 4. Enforce NOT NULL and add FKs.
    await queryRunner.query(
      `ALTER TABLE "form" ALTER COLUMN "formSnapshotId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_response" ALTER COLUMN "formSnapshotId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "form" ADD CONSTRAINT "FK_972b364608ed4d74feba5d9edb7" FOREIGN KEY ("formSnapshotId") REFERENCES "form_snapshot"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_response" ADD CONSTRAINT "FK_412438b53ac99973a9577518ba9" FOREIGN KEY ("formSnapshotId") REFERENCES "form_snapshot"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    // 5. Drop the now-redundant jsonb columns. Schema is read via the
    //    formSnapshot relation from here on.
    await queryRunner.query(`ALTER TABLE "form" DROP COLUMN "schema"`);
    await queryRunner.query(
      `ALTER TABLE "form_response" DROP COLUMN "schemaSnapshot"`,
    );

    // 6. Create the join table for Form.historicalFormSnapshots. The name
    //    is pinned via FORM_SNAPSHOT_HISTORY_TABLE on the entity so a
    //    rename of the relation field can't silently change it. Records
    //    every (form, snapshot) pair the form has ever pointed at — used
    //    at submit time so a stale client (loaded before an updateForm
    //    swapped snapshots) can still submit against its old snapshot.
    await queryRunner.query(
      `CREATE TABLE "form_snapshot_history" (
        "formId" integer NOT NULL,
        "formSnapshotId" integer NOT NULL,
        CONSTRAINT "PK_dc551d318fba4118745dc1e39bf" PRIMARY KEY ("formId", "formSnapshotId")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f23d2e1d4abfd2dbbf2f331462" ON "form_snapshot_history" ("formId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_251235ebfa1d534294d6c0d027" ON "form_snapshot_history" ("formSnapshotId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_snapshot_history" ADD CONSTRAINT "FK_f23d2e1d4abfd2dbbf2f3314620" FOREIGN KEY ("formId") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_snapshot_history" ADD CONSTRAINT "FK_251235ebfa1d534294d6c0d027f" FOREIGN KEY ("formSnapshotId") REFERENCES "form_snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    // 7. Backfill historical pairs: each form's current snapshot, plus
    //    every (formId, formSnapshotId) that already appears on a
    //    form_response (these are snapshots the form was previously
    //    pointing at when older responses were submitted).
    await queryRunner.query(`
      INSERT INTO "form_snapshot_history" ("formId", "formSnapshotId")
      SELECT "id", "formSnapshotId" FROM "form"
      UNION
      SELECT "formId", "formSnapshotId" FROM "form_response"
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_snapshot_history" DROP CONSTRAINT "FK_251235ebfa1d534294d6c0d027f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_snapshot_history" DROP CONSTRAINT "FK_f23d2e1d4abfd2dbbf2f3314620"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_251235ebfa1d534294d6c0d027"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f23d2e1d4abfd2dbbf2f331462"`,
    );
    await queryRunner.query(`DROP TABLE "form_snapshot_history"`);

    // Restore the jsonb columns and copy data back from the snapshots.
    await queryRunner.query(`ALTER TABLE "form" ADD COLUMN "schema" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "form_response" ADD COLUMN "schemaSnapshot" jsonb`,
    );
    await queryRunner.query(`
      UPDATE "form" f
      SET "schema" = s."schema"
      FROM "form_snapshot" s
      WHERE s."id" = f."formSnapshotId"
    `);
    await queryRunner.query(`
      UPDATE "form_response" fr
      SET "schemaSnapshot" = s."schema"
      FROM "form_snapshot" s
      WHERE s."id" = fr."formSnapshotId"
    `);
    await queryRunner.query(
      `ALTER TABLE "form" ALTER COLUMN "schema" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_response" ALTER COLUMN "schemaSnapshot" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "form" DROP CONSTRAINT "FK_972b364608ed4d74feba5d9edb7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_response" DROP CONSTRAINT "FK_412438b53ac99973a9577518ba9"`,
    );
    await queryRunner.query(`ALTER TABLE "form" DROP COLUMN "formSnapshotId"`);
    await queryRunner.query(
      `ALTER TABLE "form_response" DROP COLUMN "formSnapshotId"`,
    );

    await queryRunner.query(`DROP INDEX "public"."IDX_form_snapshot_hash"`);
    await queryRunner.query(`DROP TABLE "form_snapshot"`);
  }
}
