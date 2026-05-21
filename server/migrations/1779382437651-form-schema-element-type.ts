import { createHash } from 'crypto';

import jsonStableStringify from 'json-stable-stringify';
import { MigrationInterface, QueryRunner } from 'typeorm';

// Adds a top-level `type` discriminator to every form element embedded in a
// form schema. AnyField variants get `type: "input"`; DisplayBlock variants
// get `type: "display"`. Pre-migration the two unions were distinguished
// structurally (fields have `label`, blocks don't) and by their `kind` values;
// the only overlapping `kind` value is `"text"`, which we disambiguate via
// the presence of a `label` property. Idempotent: elements that already have
// `type` are skipped.
//
// Paths walked inside each schema:
//   - pages[*].fields[*]                          (AnyField | DisplayBlock)
//   - pages[*].fields[*].fields[*]                (ListField sub-fields, all AnyField)
//   - outputViews[*].blocks[*]                    (DisplayBlock | OutputFieldBlock)
//
// OutputFieldBlock has no `kind`, so it's skipped naturally. Aggregate views
// (`aggregateViews[*]`) have a `kind: "progressbar"` discriminator that is NOT
// a DisplayBlock — they're left alone.
//
// Tables walked:
//   - form_snapshot.schema  (hash is recomputed since FormSnapshot is content-addressed)
//   - general_update.schema
// form.schema and form_response.schemaSnapshot were dropped in migration
// 1777328934057-form-snapshot.

const FIELD_KINDS = new Set<string>([
  'text',
  'textarea',
  'email',
  'number',
  'range',
  'phone',
  'checkbox',
  'radio',
  'select',
  'multiselect',
  'date',
  'time',
  'timezone',
  'file',
  'city',
  'contract',
  'list',
  'custom',
]);

const BLOCK_KINDS = new Set<string>([
  'header',
  'text',
  'label',
  'divider',
  'spacer',
  'html',
  'image',
  'video',
  'quote',
  'biglink',
  'copytext',
  'previousAnswer',
]);

type ElementType = 'input' | 'display';

function classifyElement(
  obj: Record<string, unknown>,
): ElementType | undefined {
  const kind = obj.kind;
  if (typeof kind !== 'string') return undefined;
  const isField = FIELD_KINDS.has(kind);
  const isBlock = BLOCK_KINDS.has(kind);
  if (isField && !isBlock) return 'input';
  if (isBlock && !isField) return 'display';
  if (isField && isBlock) {
    // Only "text" overlaps; disambiguate by presence of `label` (required on
    // TextField, absent on TextBlock).
    return 'label' in obj ? 'input' : 'display';
  }
  return undefined;
}

function applyType(node: unknown, expected?: ElementType): void {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return;
  const obj = node as Record<string, unknown>;
  if (typeof obj.type === 'string') return; // already migrated
  const classified = expected ?? classifyElement(obj);
  if (!classified) return;
  obj.type = classified;
}

function stripType(node: unknown): void {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return;
  const obj = node as Record<string, unknown>;
  if (obj.type === 'input' || obj.type === 'display') {
    delete obj.type;
  }
}

function visitField(
  field: unknown,
  apply: (n: unknown, t?: ElementType) => void,
): void {
  if (!field || typeof field !== 'object' || Array.isArray(field)) return;
  apply(field, 'input');
  const obj = field as Record<string, unknown>;
  // Recurse into ListField sub-fields.
  if (obj.kind === 'list' && Array.isArray(obj.fields)) {
    for (const sub of obj.fields) {
      visitField(sub, apply);
    }
  }
}

function visitSchema(
  schema: unknown,
  apply: (n: unknown, t?: ElementType) => void,
): void {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return;
  const s = schema as Record<string, unknown>;

  if (Array.isArray(s.pages)) {
    for (const page of s.pages) {
      if (!page || typeof page !== 'object') continue;
      const fields = (page as Record<string, unknown>).fields;
      if (!Array.isArray(fields)) continue;
      for (const el of fields) {
        if (!el || typeof el !== 'object' || Array.isArray(el)) continue;
        const obj = el as Record<string, unknown>;
        const kind = obj.kind;
        if (typeof kind !== 'string') continue;
        if (FIELD_KINDS.has(kind) && !BLOCK_KINDS.has(kind)) {
          visitField(el, apply);
        } else {
          apply(el); // classifier will decide input vs display (handles "text")
          // If it ended up classified as a list field, also recurse.
          if (kind === 'list' && Array.isArray(obj.fields)) {
            for (const sub of obj.fields) visitField(sub, apply);
          }
        }
      }
    }
  }

  if (Array.isArray(s.outputViews)) {
    for (const view of s.outputViews) {
      if (!view || typeof view !== 'object') continue;
      const blocks = (view as Record<string, unknown>).blocks;
      if (!Array.isArray(blocks)) continue;
      for (const block of blocks) {
        if (!block || typeof block !== 'object' || Array.isArray(block))
          continue;
        const obj = block as Record<string, unknown>;
        // OutputFieldBlock has no `kind`; only DisplayBlocks here get `type`.
        if (typeof obj.kind !== 'string') continue;
        apply(block, 'display');
      }
    }
  }
}

function hashSchema(schema: unknown): string {
  return createHash('sha256')
    .update(jsonStableStringify(schema) ?? '')
    .digest('hex');
}

async function migrateGeneralUpdateSchema(
  queryRunner: QueryRunner,
  apply: (n: unknown, t?: ElementType) => void,
): Promise<void> {
  const rows: { id: number; payload: unknown }[] = await queryRunner.query(
    `SELECT id, "schema" AS payload FROM "general_update"`,
  );
  for (const row of rows) {
    if (row.payload === null || row.payload === undefined) continue;
    const before = JSON.stringify(row.payload);
    visitSchema(row.payload, apply);
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
  apply: (n: unknown, t?: ElementType) => void,
): Promise<void> {
  const rows: { id: number; payload: unknown }[] = await queryRunner.query(
    `SELECT id, "schema" AS payload FROM "form_snapshot"`,
  );
  for (const row of rows) {
    if (row.payload === null || row.payload === undefined) continue;
    const before = JSON.stringify(row.payload);
    visitSchema(row.payload, apply);
    const after = JSON.stringify(row.payload);
    if (before === after) continue;
    const newHash = hashSchema(row.payload);
    await queryRunner.query(
      `UPDATE "form_snapshot" SET "schema" = $1::jsonb, "hash" = $2 WHERE "id" = $3`,
      [after, newHash, row.id],
    );
  }
}

export class FormSchemaElementType1779382437651 implements MigrationInterface {
  name = 'FormSchemaElementType1779382437651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await migrateFormSnapshot(queryRunner, applyType);
    await migrateGeneralUpdateSchema(queryRunner, applyType);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await migrateFormSnapshot(queryRunner, stripType);
    await migrateGeneralUpdateSchema(queryRunner, stripType);
  }
}
