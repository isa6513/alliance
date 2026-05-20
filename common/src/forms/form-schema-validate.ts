import type { DisplayBlock } from "./display-blocks";
import type {
  AnyField,
  FormSchema,
  ListField,
  OutputViewSchema,
} from "./form-schema";
import type { Condition, VisibleIfFormula } from "./visible-if-formula";

export type FormSchemaValidationError = {
  viewId?: string;
  blockId: string;
  message: string;
};

type ContextKind = "input" | "output";

export function validateFormSchema(
  schema: FormSchema,
): FormSchemaValidationError[] {
  const errors: FormSchemaValidationError[] = [];

  for (const page of schema.pages ?? []) {
    for (const item of page.fields ?? []) {
      collectInputErrors(item, errors);
    }
  }

  for (const view of schema.outputViews ?? []) {
    const outputBlockIds = new Set<string>();
    for (const b of view.blocks) {
      if (b.id) outputBlockIds.add(b.id);
    }

    for (const block of view.blocks) {
      const blockId = block.id ?? "<unnamed>";
      checkConditions(
        block.visibleIfFormula,
        {
          context: "output",
          allowedOutputBlockIds: outputBlockIds,
          viewId: view.id,
          blockId,
        },
        errors,
      );
    }

    collectCycleErrors(view, outputBlockIds, errors);
  }

  return errors;
}

function collectCycleErrors(
  view: OutputViewSchema,
  outputBlockIds: Set<string>,
  errors: FormSchemaValidationError[],
): void {
  const deps = new Map<string, string[]>();
  for (const block of view.blocks) {
    if (!block.id) continue;
    const edges: string[] = [];
    for (const cond of Object.values(
      block.visibleIfFormula?.conditions ?? {},
    )) {
      if (
        cond.kind === "outputBlockVisible" &&
        outputBlockIds.has(cond.outputBlockVisible)
      ) {
        edges.push(cond.outputBlockVisible);
      }
    }
    deps.set(block.id, edges);
  }

  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  const path: string[] = [];
  const reported = new Set<string>();

  const visit = (nodeId: string): void => {
    if (color.get(nodeId) === BLACK) return;
    color.set(nodeId, GRAY);
    path.push(nodeId);
    for (const dep of deps.get(nodeId) ?? []) {
      if (color.get(dep) === GRAY) {
        const cycleStart = path.indexOf(dep);
        const cycle = path.slice(cycleStart);
        const key = [...cycle].sort().join("|");
        if (!reported.has(key)) {
          reported.add(key);
          errors.push({
            viewId: view.id,
            blockId: cycle[0],
            message: `Cycle in outputBlockVisible references: ${[
              ...cycle,
              cycle[0],
            ].join(" -> ")}`,
          });
        }
      } else {
        visit(dep);
      }
    }
    path.pop();
    color.set(nodeId, BLACK);
  };

  for (const id of deps.keys()) {
    visit(id);
  }
}

function collectInputErrors(
  item: AnyField | DisplayBlock,
  errors: FormSchemaValidationError[],
): void {
  const blockId = item.id ?? "<unnamed>";
  checkConditions(item.visibleIfFormula, { context: "input", blockId }, errors);
  if ("requiredIf" in item && item.requiredIf) {
    checkCondition(item.requiredIf, { context: "input", blockId }, errors);
  }
  if ("kind" in item && item.kind === "list") {
    const listField = item as ListField;
    for (const subField of listField.fields ?? []) {
      collectInputErrors(subField, errors);
    }
  }
}

type CheckCtx = {
  context: ContextKind;
  allowedOutputBlockIds?: Set<string>;
  viewId?: string;
  blockId: string;
};

function checkConditions(
  formula: VisibleIfFormula | undefined,
  ctx: CheckCtx,
  errors: FormSchemaValidationError[],
): void {
  const conditions = formula?.conditions;
  if (!conditions) return;
  for (const cond of Object.values(conditions)) {
    checkCondition(cond, ctx, errors);
  }
}

function checkCondition(
  cond: Condition,
  ctx: CheckCtx,
  errors: FormSchemaValidationError[],
): void {
  if (cond.kind !== "outputBlockVisible") return;
  if (ctx.context !== "output") {
    errors.push({
      viewId: ctx.viewId,
      blockId: ctx.blockId,
      message:
        '"outputBlockVisible" condition is only valid on output-view blocks',
    });
    return;
  }
  if (!ctx.allowedOutputBlockIds?.has(cond.outputBlockVisible)) {
    errors.push({
      viewId: ctx.viewId,
      blockId: ctx.blockId,
      message: `References missing output block "${cond.outputBlockVisible}"`,
    });
  }
}
