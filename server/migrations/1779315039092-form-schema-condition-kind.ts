import { createHash } from 'crypto';

import jsonStableStringify from 'json-stable-stringify';
import { MigrationInterface, QueryRunner } from 'typeorm';

// Adds a `kind` discriminator to every Condition embedded in a form schema's
// visibility/required-if rules. Pre-migration shape is differentiated by which
// optional property is present (`equals`, `hasValue`, `validatorId`, etc.);
// post-migration each Condition carries `kind: "equals" | "hasValue" | ...`
// explicitly. Idempotent: conditions that already have `kind` are skipped.
//
// Tables walked:
//   - form_snapshot.schema  (hash is recomputed since FormSnapshot is content-addressed)
//   - general_update.schema
// form.schema and form_response.schemaSnapshot were dropped in migration
// 1777328934057-form-snapshot.

type ConditionKind =
  | 'equals'
  | 'includesOption'
  | 'anySelected'
  | 'hasValue'
  | 'validator'
  | 'deviceType'
  | 'outputBlockVisible';

function inferConditionKind(
  c: Record<string, unknown>,
): ConditionKind | undefined {
  if (typeof c.kind === 'string') return undefined; // already migrated
  if ('equals' in c) return 'equals';
  if ('includesOption' in c) return 'includesOption';
  if ('anySelected' in c) return 'anySelected';
  if ('hasValue' in c) return 'hasValue';
  if ('validatorId' in c) return 'validator';
  if ('deviceType' in c) return 'deviceType';
  if ('outputBlockVisible' in c) return 'outputBlockVisible';
  return undefined;
}

function applyConditionKind(c: unknown): boolean {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return false;
  const obj = c as Record<string, unknown>;
  const kind = inferConditionKind(obj);
  if (!kind) return false;
  obj.kind = kind;
  return true;
}

// Anywhere we find a `visibleIfFormula.conditions: Record<string, Condition>`,
// rewrite each condition to include `kind`. Also handles `requiredIf: Condition`.
function visitJson(node: unknown): void {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) visitJson(item);
    return;
  }
  const o = node as Record<string, unknown>;

  if (
    'requiredIf' in o &&
    o.requiredIf &&
    typeof o.requiredIf === 'object' &&
    !Array.isArray(o.requiredIf)
  ) {
    applyConditionKind(o.requiredIf);
  }

  if (
    'visibleIfFormula' in o &&
    o.visibleIfFormula &&
    typeof o.visibleIfFormula === 'object' &&
    !Array.isArray(o.visibleIfFormula)
  ) {
    const formula = o.visibleIfFormula as Record<string, unknown>;
    const conditions = formula.conditions;
    if (conditions && typeof conditions === 'object' && !Array.isArray(conditions)) {
      for (const value of Object.values(conditions as Record<string, unknown>)) {
        applyConditionKind(value);
      }
    }
  }

  for (const v of Object.values(o)) {
    visitJson(v);
  }
}

function stripKind(c: unknown): boolean {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return false;
  const obj = c as Record<string, unknown>;
  if (!('kind' in obj)) return false;
  delete obj.kind;
  return true;
}

function visitJsonStrip(node: unknown): void {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) visitJsonStrip(item);
    return;
  }
  const o = node as Record<string, unknown>;

  if (
    'requiredIf' in o &&
    o.requiredIf &&
    typeof o.requiredIf === 'object' &&
    !Array.isArray(o.requiredIf)
  ) {
    stripKind(o.requiredIf);
  }

  if (
    'visibleIfFormula' in o &&
    o.visibleIfFormula &&
    typeof o.visibleIfFormula === 'object' &&
    !Array.isArray(o.visibleIfFormula)
  ) {
    const formula = o.visibleIfFormula as Record<string, unknown>;
    const conditions = formula.conditions;
    if (conditions && typeof conditions === 'object' && !Array.isArray(conditions)) {
      for (const value of Object.values(conditions as Record<string, unknown>)) {
        stripKind(value);
      }
    }
  }

  for (const v of Object.values(o)) {
    visitJsonStrip(v);
  }
}

function hashSchema(schema: unknown): string {
  return createHash('sha256')
    .update(jsonStableStringify(schema) ?? '')
    .digest('hex');
}

async function migrateGeneralUpdateSchema(
  queryRunner: QueryRunner,
  visit: (node: unknown) => void,
): Promise<void> {
  const rows: { id: number; payload: unknown }[] = await queryRunner.query(
    `SELECT id, "schema" AS payload FROM "general_update"`,
  );
  for (const row of rows) {
    if (row.payload === null || row.payload === undefined) continue;
    const before = JSON.stringify(row.payload);
    visit(row.payload);
    const after = JSON.stringify(row.payload);
    if (before !== after) {
      await queryRunner.query(
        `UPDATE "general_update" SET "schema" = $1::jsonb WHERE "id" = $2`,
        [after, row.id],
      );
    }
  }
}

async function migrateFormSnapshot(
  queryRunner: QueryRunner,
  visit: (node: unknown) => void,
): Promise<void> {
  const rows: { id: number; payload: unknown }[] = await queryRunner.query(
    `SELECT id, "schema" AS payload FROM "form_snapshot"`,
  );
  for (const row of rows) {
    if (row.payload === null || row.payload === undefined) continue;
    const before = JSON.stringify(row.payload);
    visit(row.payload);
    const after = JSON.stringify(row.payload);
    if (before === after) continue;
    const newHash = hashSchema(row.payload);
    await queryRunner.query(
      `UPDATE "form_snapshot" SET "schema" = $1::jsonb, "hash" = $2 WHERE "id" = $3`,
      [after, newHash, row.id],
    );
  }
}

export class FormSchemaConditionKind1779315039092
  implements MigrationInterface
{
  name = 'FormSchemaConditionKind1779315039092';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await migrateFormSnapshot(queryRunner, visitJson);
    await migrateGeneralUpdateSchema(queryRunner, visitJson);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await migrateFormSnapshot(queryRunner, visitJsonStrip);
    await migrateGeneralUpdateSchema(queryRunner, visitJsonStrip);
  }
}
