import type { DeviceVisibilityTarget } from "./device";

export type Condition =
  | {
      when: string;
      equals: string | number | boolean | null;
      sourceFormId?: number;
    }
  | { when: string; includesOption: string; sourceFormId?: number }
  | { when: string; anySelected: boolean; sourceFormId?: number }
  | { when: string; hasValue: boolean; sourceFormId?: number }
  | { validatorId: number; resultEquals?: boolean }
  | { deviceType: DeviceVisibilityTarget[] }
  | { outputBlockVisible: string; isVisible?: boolean };

/** Formula tree for visibility: AND/OR of two operands, NOT of one. Leaves are condition names (e.g. condition1, condition2). */
export type FormulaNode =
  | { op: "AND"; left: FormulaNode | string; right: FormulaNode | string }
  | { op: "OR"; left: FormulaNode | string; right: FormulaNode | string }
  | { op: "NOT"; operand: FormulaNode | string }
  | string;

/** Named conditions (condition1, condition2, ...) plus a formula tree. */
export interface VisibleIfFormula {
  conditions: Record<string, Condition>;
  formula: FormulaNode;
}

export function evaluateVisibilityFormula(
  node: FormulaNode,
  results: Record<string, boolean>,
): boolean {
  if (typeof node === "string") return results[node] === true;
  if (node.op === "NOT") {
    const operand =
      typeof node.operand === "string"
        ? results[node.operand] === true
        : evaluateVisibilityFormula(node.operand, results);
    return !operand;
  }
  if (node.op === "AND") {
    const left =
      typeof node.left === "string"
        ? results[node.left] === true
        : evaluateVisibilityFormula(node.left, results);
    const right =
      typeof node.right === "string"
        ? results[node.right] === true
        : evaluateVisibilityFormula(node.right, results);
    return left && right;
  }
  if (node.op === "OR") {
    const left =
      typeof node.left === "string"
        ? results[node.left] === true
        : evaluateVisibilityFormula(node.left, results);
    const right =
      typeof node.right === "string"
        ? results[node.right] === true
        : evaluateVisibilityFormula(node.right, results);
    return left || right;
  }
  return false;
}
