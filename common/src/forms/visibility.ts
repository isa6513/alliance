import type { DeviceVisibilityTarget } from "./device";
import type { DisplayBlock } from "./display-blocks";
import type { AnyField, FormValue, OutputFieldBlock } from "./form-schema";
import {
  type Condition,
  evaluateVisibilityFormula,
} from "./visible-if-formula";

export const hasContent = (value: FormValue | undefined): boolean => {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
};

export type ConditionExtras = {
  deviceType: DeviceVisibilityTarget;
  visibilityValidatorResults?: Record<number, boolean>;
  fieldLookup?: Map<string, AnyField>;
  visibilityMemo?: Map<string, boolean>;
  visibilityEvaluationStack?: Set<string>;
  previousAnswerData?: Record<number, Record<string, unknown>>;
  outputBlockVisibility?: Map<string, boolean>;
};

function resolveConditionValue(
  cond: Condition & { when: string },
  data: Record<string, FormValue>,
  extras: ConditionExtras,
): FormValue | undefined {
  if (
    "sourceFormId" in cond &&
    cond.sourceFormId != null &&
    extras.previousAnswerData
  ) {
    return extras.previousAnswerData[cond.sourceFormId]?.[
      cond.when
    ] as FormValue;
  }
  return data[cond.when];
}

const evaluateValueBasedCondition = (
  cond: Condition,
  val: FormValue | undefined,
): boolean => {
  if ("hasValue" in cond) {
    const present = hasContent(val);
    return cond.hasValue ? present : !present;
  }
  if ("anySelected" in cond) {
    const selections = Array.isArray(val) ? val : [];
    return cond.anySelected ? selections.length > 0 : selections.length === 0;
  }
  if ("includesOption" in cond) {
    if (!cond.includesOption) {
      return false;
    }
    return (
      Array.isArray(val) &&
      val.every((e) => typeof e === "string") &&
      (val as string[]).includes(cond.includesOption)
    );
  }
  if (!("equals" in cond)) {
    return true;
  }
  const equals = cond.equals;
  if (typeof equals === "boolean") {
    if (val === undefined || val === null) {
      return false;
    }
    return val === equals;
  }
  if (typeof equals === "number" && Number.isFinite(equals)) {
    if (val === "" || val === undefined || val === null) {
      return false;
    }
    if (typeof val === "number" && Number.isFinite(val)) {
      return val === equals;
    }
    if (typeof val === "string" && val.trim() !== "") {
      const n = Number(val);
      return Number.isFinite(n) && n === equals;
    }
    return false;
  }
  if (Array.isArray(val) && equals !== null && equals !== undefined) {
    return (
      Array.isArray(val) &&
      val.every((e) => typeof e === "string") &&
      (val as string[]).includes(equals as string)
    );
  }
  return val === equals;
};

export function evaluateCondition(
  cond: Condition,
  data: Record<string, FormValue>,
  extras: ConditionExtras,
): boolean {
  if ("expr" in cond) {
    return true;
  }
  if ("deviceType" in cond) {
    if (!Array.isArray(cond.deviceType) || cond.deviceType.length === 0) {
      return false;
    }
    return cond.deviceType.includes(extras.deviceType);
  }
  if ("validatorId" in cond) {
    const expected = cond.resultEquals ?? true;
    const actual = extras.visibilityValidatorResults?.[cond.validatorId];
    if (actual === undefined) {
      return false;
    }
    return actual === expected;
  }
  if ("outputBlockVisible" in cond) {
    const expected = cond.isVisible ?? true;
    const actual =
      extras.outputBlockVisibility?.get(cond.outputBlockVisible) ?? true;
    return actual === expected;
  }
  const val = resolveConditionValue(cond, data, extras);
  return evaluateValueBasedCondition(cond, val);
}

export function isElementCurrentlyVisible(
  element: AnyField | DisplayBlock | OutputFieldBlock,
  data: Record<string, FormValue>,
  extras: ConditionExtras & { readOnly?: boolean },
): boolean {
  const formula = element.visibleIfFormula;
  const hasFormula =
    formula?.conditions &&
    Object.keys(formula.conditions).length > 0 &&
    formula.formula;
  if (!hasFormula) {
    return true;
  }
  if (extras.readOnly && element.id) {
    const existing = data[element.id];
    if (existing !== undefined && existing !== null) {
      return true;
    }
  }

  const visibilityMemo = extras.visibilityMemo ?? new Map<string, boolean>();
  const visibilityEvaluationStack =
    extras.visibilityEvaluationStack ?? new Set<string>();

  const isReferencedFieldVisible = (fieldId: string): boolean => {
    const fieldLookup = extras.fieldLookup;
    if (!fieldLookup) {
      return true;
    }

    const memoized = visibilityMemo.get(fieldId);
    if (memoized !== undefined) {
      return memoized;
    }

    const referencedField = fieldLookup.get(fieldId);
    if (!referencedField) {
      return true;
    }

    // Cyclic dependencies fall back to legacy value-only behavior.
    if (visibilityEvaluationStack.has(fieldId)) {
      return true;
    }

    visibilityEvaluationStack.add(fieldId);
    const visible = isElementCurrentlyVisible(referencedField, data, {
      ...extras,
      visibilityMemo,
      visibilityEvaluationStack,
    });
    visibilityEvaluationStack.delete(fieldId);
    visibilityMemo.set(fieldId, visible);
    return visible;
  };

  const resolveValue = (
    cond: Condition & { when: string },
  ): FormValue | undefined => {
    if (
      "sourceFormId" in cond &&
      cond.sourceFormId != null &&
      extras.previousAnswerData
    ) {
      return extras.previousAnswerData[cond.sourceFormId]?.[
        cond.when
      ] as FormValue;
    }
    return isReferencedFieldVisible(cond.when) ? data[cond.when] : undefined;
  };

  const results: Record<string, boolean> = {};
  for (const [name, cond] of Object.entries(formula!.conditions)) {
    if (
      "expr" in cond ||
      "deviceType" in cond ||
      "validatorId" in cond ||
      "outputBlockVisible" in cond
    ) {
      results[name] = evaluateCondition(cond, data, extras);
    } else {
      const value = resolveValue(cond as Condition & { when: string });
      results[name] = evaluateValueBasedCondition(cond, value);
    }
  }
  return evaluateVisibilityFormula(formula!.formula, results);
}
