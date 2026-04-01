import { MigrationInterface, QueryRunner } from 'typeorm';

type FormulaNode =
  | { op: 'AND'; left: FormulaNode | string; right: FormulaNode | string }
  | { op: 'OR'; left: FormulaNode | string; right: FormulaNode | string }
  | { op: 'NOT'; operand: FormulaNode | string }
  | string;

function normalizeVisibleIf(raw: unknown): unknown[] {
  if (raw === undefined || raw === null) return [];
  if (Array.isArray(raw)) return raw;
  return [raw];
}

function buildAndFormula(n: number): FormulaNode {
  if (n <= 0) return 'condition1';
  if (n === 1) return 'condition1';
  const names = Array.from({ length: n }, (_, i) => `condition${i + 1}`);
  let node: FormulaNode = names[0];
  for (let i = 1; i < names.length; i++) {
    node = { op: 'AND', left: node, right: names[i] };
  }
  return node;
}

function hasUsableVisibleIfFormula(formula: unknown): boolean {
  if (!formula || typeof formula !== 'object' || Array.isArray(formula)) {
    return false;
  }
  const f = formula as Record<string, unknown>;
  const conditions = f.conditions;
  if (
    !conditions ||
    typeof conditions !== 'object' ||
    Array.isArray(conditions) ||
    Object.keys(conditions as object).length === 0
  ) {
    return false;
  }
  return f.formula !== undefined && f.formula !== null;
}

function convertVisibleIfOnObject(o: Record<string, unknown>): void {
  if (!('visibleIf' in o)) return;
  const visibleIfVal = o.visibleIf;
  if (visibleIfVal === undefined) return;

  if (!hasUsableVisibleIfFormula(o.visibleIfFormula)) {
    const conditions = normalizeVisibleIf(visibleIfVal);
    if (conditions.length > 0) {
      const condMap: Record<string, unknown> = {};
      conditions.forEach((c, i) => {
        condMap[`condition${i + 1}`] = c;
      });
      o.visibleIfFormula = {
        conditions: condMap,
        formula: buildAndFormula(conditions.length),
      };
    }
  }
  delete o.visibleIf;
}

function visitJson(node: unknown): void {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) visitJson(item);
    return;
  }
  const o = node as Record<string, unknown>;
  convertVisibleIfOnObject(o);
  for (const v of Object.values(o)) {
    visitJson(v);
  }
}

async function migrateTableJsonColumn(
  queryRunner: QueryRunner,
  table: string,
  column: string,
): Promise<void> {
  const rows: { id: number; payload: unknown }[] = await queryRunner.query(
    `SELECT id, "${column}" AS payload FROM "${table}"`,
  );
  for (const row of rows) {
    if (row.payload === null || row.payload === undefined) continue;
    const before = JSON.stringify(row.payload);
    visitJson(row.payload);
    const after = JSON.stringify(row.payload);
    if (before !== after) {
      await queryRunner.query(
        `UPDATE "${table}" SET "${column}" = $1::jsonb WHERE "id" = $2`,
        [after, row.id],
      );
    }
  }
}

export class FormSchemaVisibleIfFormula1775072900025 implements MigrationInterface {
  name = 'FormSchemaVisibleIfFormula1775072900025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await migrateTableJsonColumn(queryRunner, 'form', 'schema');
    await migrateTableJsonColumn(queryRunner, 'general_update', 'schema');
    await migrateTableJsonColumn(queryRunner, 'form_response', 'schemaSnapshot');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    void queryRunner;
    // Irreversible: visibleIf was removed; restoring from visibleIfFormula is ambiguous.
  }
}
