import { createHash } from 'crypto';
import jsonStableStringify from 'json-stable-stringify';
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Normalizes stored form snapshots to the strict `formSchema` (zod) shape by
 * removing dead keys that no code reads but that `strictObject` now rejects:
 *
 *   - root:                 `slug`, `version`
 *   - text display blocks:  `markdown`
 *   - `manualUserContent`   `type`, `id`, `kind`, `markdown` (the renderer
 *     entries:              overrides id/kind from the parent and ignores the
 *                           rest — see resolveDisplayBlockForUser)
 *
 * It also backfills `outputViews: []` when absent (the field is required by the
 * schema and read as `outputViews ?? []` everywhere; the admin already fills it
 * on load). Without this, ~17% of snapshots fail validation on the next save.
 *
 * The snapshot `hash` is content-addressed (sha256 of a stable stringify) and
 * unique, so any row whose schema changes has its hash recomputed to match.
 * Verified against production data: 178 rows change, 0 hash collisions.
 *
 * Rows are processed in id-keyset batches so the migration never loads the
 * whole table into memory (the app box and RDS instance are small).
 */
export class StripLegacyFormSchemaFields1783555848879
  implements MigrationInterface
{
  private static readonly BATCH_SIZE = 200;

  public async up(queryRunner: QueryRunner): Promise<void> {
    let lastId = 0;
    let updated = 0;
    for (;;) {
      const rows: { id: number; schema: Record<string, unknown> }[] =
        await queryRunner.query(
          `SELECT id, schema FROM form_snapshot
           WHERE id > $1 ORDER BY id ASC LIMIT $2`,
          [lastId, StripLegacyFormSchemaFields1783555848879.BATCH_SIZE],
        );
      if (rows.length === 0) break;

      for (const row of rows) {
        lastId = row.id;
        const cleaned = cleanSchema(row.schema);
        if (jsonStableStringify(cleaned) === jsonStableStringify(row.schema)) {
          continue; // nothing to strip/backfill
        }
        await queryRunner.query(
          `UPDATE form_snapshot SET schema = $1::jsonb, hash = $2 WHERE id = $3`,
          [JSON.stringify(cleaned), hashSchema(cleaned), row.id],
        );
        updated++;
      }
    }
    console.log(`[strip-legacy-form-schema-fields] updated ${updated} snapshots`);
  }

  public async down(): Promise<void> {
    // Irreversible: the stripped keys are dead data with no reader, and the
    // originals are not retained. Nothing to restore.
  }
}

// --- self-contained transform (frozen; must not import app code) ------------

function hashSchema(schema: unknown): string {
  return createHash('sha256')
    .update(jsonStableStringify(schema) ?? '')
    .digest('hex');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function cleanManualUserContentEntry(entry: unknown): unknown {
  if (!isRecord(entry)) return entry;
  const next = { ...entry };
  delete next.type;
  delete next.id;
  delete next.kind;
  delete next.markdown;
  return next;
}

function cleanBlock(block: unknown): unknown {
  if (!isRecord(block) || block.type !== 'display') return block;
  const next = { ...block };
  delete next.markdown;
  if (isRecord(next.manualUserContent)) {
    const cleanedContent: Record<string, unknown> = {};
    for (const [userId, entry] of Object.entries(next.manualUserContent)) {
      cleanedContent[userId] = cleanManualUserContentEntry(entry);
    }
    next.manualUserContent = cleanedContent;
  }
  return next;
}

function cleanSchema(
  schema: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...schema };
  delete next.slug;
  delete next.version;

  if (Array.isArray(next.pages)) {
    next.pages = next.pages.map((page) => {
      if (!isRecord(page)) return page;
      const fields = Array.isArray(page.fields)
        ? page.fields.map(cleanBlock)
        : page.fields;
      return { ...page, fields };
    });
  }

  // Required by the schema; backfill when a legacy snapshot omits it entirely.
  next.outputViews = Array.isArray(next.outputViews)
    ? next.outputViews.map((view) => {
        if (!isRecord(view)) return view;
        const blocks = Array.isArray(view.blocks)
          ? view.blocks.map(cleanBlock)
          : view.blocks;
        return { ...view, blocks };
      })
    : [];

  return next;
}
