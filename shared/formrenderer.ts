import type { DisplayBlock } from "@alliance/common/forms/display-blocks";
import {
  type AnyField,
  type CityFieldValue,
  type Condition,
  type FormValue,
  type ListField,
  type NumberField,
  type OutputFieldBlock,
  type RangeField,
} from "@alliance/common/forms/form-schema";
import type { DeviceVisibilityTarget } from "@alliance/common/forms/device";
import { parseTimeToMinutes } from "@alliance/shared/forms/timeUtils";
import { evaluateVisibilityFormula } from "@alliance/common/forms/visible-if-formula";

export const FALLBACK_TIMEZONE = "America/Los_Angeles";
const DEFAULT_RANGE_OPTION_COUNT = 10;
const MIN_RANGE_OPTION_COUNT = 2;
const MAX_RANGE_OPTION_COUNT = 50;

/**
 * Compute a stable storage key for a form draft.
 * Format: `form:<slug>:v<version>[:<instanceId>]`
 */
export function computeFormStorageKey(args: {
  formId: number;
  instanceId?: string | number | null;
}): string {
  const base = `form:${args.formId}`;
  const hasInstance =
    args.instanceId !== undefined &&
    args.instanceId !== null &&
    args.instanceId !== "";
  return hasInstance ? `${base}:${String(args.instanceId)}` : base;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isCityValue = (value: unknown): value is CityFieldValue => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.countryName === "string" &&
    "id" in candidate
  );
};

export function getRangeOptionCount(field: RangeField): number {
  const desired = field.optionCount ?? DEFAULT_RANGE_OPTION_COUNT;
  const normalized = Number.isFinite(desired)
    ? Math.floor(desired)
    : DEFAULT_RANGE_OPTION_COUNT;
  return Math.min(
    MAX_RANGE_OPTION_COUNT,
    Math.max(MIN_RANGE_OPTION_COUNT, normalized),
  );
}

export function isValidRangeSelection(
  field: RangeField,
  value: unknown,
): value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return false;
  }
  if (field.kind !== "range") {
    return false;
  }
  const max = getRangeOptionCount(field);
  return value >= 1 && value <= max;
}

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

export function resolveFieldDefaultValue(
  field: AnyField,
): FormValue | undefined {
  const rawDefault = field.defaultValue;

  if (rawDefault === null) {
    return undefined;
  }

  if (rawDefault !== undefined) {
    switch (field.kind) {
      case "radio":
      case "select": {
        if (typeof rawDefault !== "string" || !isNonEmptyString(rawDefault)) {
          return undefined;
        }
        const values = field.options?.map((option) => option.value) ?? [];
        return values.includes(rawDefault) ? rawDefault : undefined;
      }
      case "multiselect": {
        if (!Array.isArray(rawDefault) || rawDefault.length === 0) {
          return undefined;
        }
        const validValues = field.options?.map((option) => option.value) ?? [];
        const filtered = rawDefault.filter(
          (value): value is string =>
            typeof value === "string" && validValues.includes(value),
        );
        return filtered.length ? filtered : undefined;
      }
      case "checkbox":
        return typeof rawDefault === "boolean" ? rawDefault : undefined;
      case "number":
        return typeof rawDefault === "number" ? rawDefault : undefined;
      case "range":
        return field.kind === "range" &&
          isValidRangeSelection(field, rawDefault)
          ? rawDefault
          : undefined;
      case "time":
      case "date":
      case "timezone":
      case "text":
      case "textarea":
      case "email":
      case "phone":
      case "file":
      case "custom":
        return isNonEmptyString(rawDefault) ? rawDefault : undefined;
      case "city":
        if (isCityValue(rawDefault)) {
          return rawDefault;
        }
        return isNonEmptyString(rawDefault) ? rawDefault : undefined;
      default:
        return isNonEmptyString(rawDefault) ? rawDefault : undefined;
    }
  }

  if (field.kind === "timezone") {
    return FALLBACK_TIMEZONE;
  }

  if (field.kind === "list") {
    const listField = field as ListField;
    const defaultNumber = Math.max(
      0,
      Math.floor(Number(listField.defaultNumber) || 0),
    );
    return Array.from({ length: defaultNumber }, () => ({})) as FormValue;
  }

  return undefined;
}

export function applyDefaultValues(
  base: Record<string, FormValue> | undefined,
  defaults: Map<string, FormValue>,
): Record<string, FormValue> {
  if (!defaults.size) {
    return base ? base : {};
  }

  let result = base ?? {};
  let mutated = false;

  for (const [fieldId, defaultValue] of defaults.entries()) {
    const current = result[fieldId];
    if (current === undefined || current === null) {
      if (!mutated) {
        result = base ? { ...base } : { ...result };
        mutated = true;
      }
      result[fieldId] = defaultValue;
    }
  }

  if (mutated) {
    return result;
  }

  return base ? base : {};
}

export function filterAnswersByFieldIds(
  answers: Record<string, FormValue> | null,
  allowedFields: Map<string, AnyField>,
): Record<string, FormValue> {
  if (!answers) {
    return {};
  }

  const filtered: Record<string, FormValue> = {};
  for (const [fieldId, value] of Object.entries(answers)) {
    if (allowedFields.has(fieldId)) {
      filtered[fieldId] = value;
    }
  }
  return filtered;
}

export type ConditionExtras = {
  deviceType?: DeviceVisibilityTarget;
  visibilityValidatorResults?: Record<number, boolean>;
  fieldLookup?: Map<string, AnyField>;
  visibilityMemo?: Map<string, boolean>;
  visibilityEvaluationStack?: Set<string>;
  previousAnswerData?: Record<number, Record<string, unknown>>;
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

export function evaluateCondition(
  cond: Condition,
  data: Record<string, FormValue>,
  extras: ConditionExtras = {},
): boolean {
  if ("expr" in cond) {
    return true;
  }
  if ("deviceType" in cond) {
    if (!Array.isArray(cond.deviceType) || cond.deviceType.length === 0) {
      return false;
    }
    return extras.deviceType
      ? cond.deviceType.includes(extras.deviceType)
      : false;
  }
  if ("validatorId" in cond) {
    const expected = cond.resultEquals ?? true;
    const actual = extras.visibilityValidatorResults?.[cond.validatorId];
    if (actual === undefined) {
      return false;
    }
    return actual === expected;
  }
  const val = resolveConditionValue(cond, data, extras);
  return evaluateValueBasedCondition(cond, val);
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

export function isElementCurrentlyVisible(
  element: AnyField | DisplayBlock | OutputFieldBlock,
  data: Record<string, FormValue>,
  extras: ConditionExtras & { readOnly?: boolean } = {},
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
    if ("expr" in cond || "deviceType" in cond || "validatorId" in cond) {
      results[name] = evaluateCondition(cond, data, extras);
    } else {
      const value = resolveValue(cond as Condition & { when: string });
      results[name] = evaluateValueBasedCondition(cond, value);
    }
  }
  return evaluateVisibilityFormula(formula!.formula, results);
}

export function isFieldConditionallyRequired(
  field: AnyField,
  data: Record<string, FormValue>,
  extras: ConditionExtras = {},
): boolean {
  if (field.requiredIf) {
    return evaluateCondition(field.requiredIf, data, extras);
  }
  return !!field.required;
}

export function validateFieldValue(
  field: AnyField,
  fieldValue: FormValue | undefined,
  data: Record<string, FormValue>,
  extras: ConditionExtras = {},
): string | null {
  const required = isFieldConditionallyRequired(field, data, extras);

  const valueToCheck = fieldValue;
  const isEmptyString =
    typeof valueToCheck === "string" && valueToCheck.trim() === "";

  if (field.kind === "multiselect") {
    const selections = Array.isArray(valueToCheck) ? valueToCheck : [];
    if (required && selections.length === 0) {
      return "Select at least one option.";
    }
    if (
      typeof field.maxSelections === "number" &&
      field.maxSelections > 0 &&
      selections.length > field.maxSelections
    ) {
      return `Select no more than ${field.maxSelections} option${
        field.maxSelections === 1 ? "" : "s"
      }.`;
    }
    return null;
  }

  switch (field.kind) {
    case "text":
    case "textarea":
    case "email":
    case "phone":
    case "date":
    case "timezone":
    case "select": {
      if (!required) return null;
      if (valueToCheck === undefined || valueToCheck === null) {
        return "This field is required.";
      }
      if (isEmptyString) {
        return "This field is required.";
      }
      return null;
    }
    case "time": {
      if (typeof valueToCheck === "string") {
        const minutes = parseTimeToMinutes(valueToCheck);
        if (minutes === null) {
          return "Enter a valid time.";
        }
      }
      if (!required) return null;
      if (valueToCheck === undefined || valueToCheck === null) {
        return "This field is required.";
      }
      if (isEmptyString) {
        return "This field is required.";
      }
      return null;
    }
    case "number": {
      const numValue =
        typeof valueToCheck === "number"
          ? valueToCheck
          : typeof valueToCheck === "string"
            ? parseFloat(valueToCheck)
            : NaN;
      const numberField = field as NumberField;

      if (Number.isNaN(numValue) && !!valueToCheck) {
        return "Please enter a valid number.";
      }
      if (typeof numberField.min === "number" && numValue < numberField.min) {
        return `Value must be at least ${numberField.min}.`;
      }
      if (typeof numberField.max === "number" && numValue > numberField.max) {
        return `Value must be at most ${numberField.max}.`;
      }
      if (
        Number.isFinite(numValue) &&
        !numberField.allowDecimals &&
        !Number.isInteger(numValue)
      ) {
        return "Decimals are not allowed for this field.";
      }
      if (
        Number.isFinite(numValue) &&
        numberField.allowDecimals &&
        typeof numberField.decimalPlaces === "number"
      ) {
        const parts = String(numValue).split(".");
        if (parts.length === 2 && parts[1].length > numberField.decimalPlaces) {
          return `Value must have at most ${numberField.decimalPlaces} decimal place${numberField.decimalPlaces === 1 ? "" : "s"}.`;
        }
      }
      if (!required) return null;
      if (
        valueToCheck === undefined ||
        valueToCheck === null ||
        valueToCheck === ""
      ) {
        return required ? "Please enter a number." : null;
      }

      if (!Number.isFinite(numValue)) {
        return "Please enter a valid number.";
      }
      return null;
    }
    case "range": {
      if (!required) return null;
      if (
        valueToCheck === undefined ||
        valueToCheck === null ||
        valueToCheck === ""
      ) {
        return "Please select a value.";
      }
      if (field.kind !== "range") {
        return "Please select a value.";
      }
      if (!isValidRangeSelection(field, valueToCheck)) {
        return "Please select a value.";
      }
      return null;
    }
    case "checkbox":
      if (!required) return null;
      return valueToCheck === true ? null : "This field is required.";
    case "radio":
      if (!required) return null;
      return valueToCheck ? null : "Please select an option.";
    case "file":
      if (!required) return null;
      return valueToCheck ? null : "Please upload a file.";
    case "list": {
      const listField = field as ListField;
      const listVal = Array.isArray(valueToCheck) ? valueToCheck : [];
      const listValTyped = listVal.every(
        (item): item is Record<string, FormValue> =>
          item !== null && typeof item === "object" && !Array.isArray(item),
      )
        ? listVal
        : [];
      const minCards = Math.max(0, Math.floor(Number(listField.min || 0)));
      const maxCards =
        typeof listField.max === "number" && listField.max >= 0
          ? Math.floor(listField.max)
          : Infinity;
      if (required && listValTyped.length === 0) {
        return "Add at least one item.";
      }
      if (listValTyped.length < minCards) {
        return `Add at least ${minCards} item${minCards === 1 ? "" : "s"}.`;
      }
      if (listValTyped.length > maxCards) {
        return `Add no more than ${maxCards} item${maxCards === 1 ? "" : "s"}.`;
      }
      return null;
    }
    default: {
      if (!required) return null;
      if (valueToCheck === undefined || valueToCheck === null) {
        return "This field is required.";
      }
      if (isEmptyString) {
        return "This field is required.";
      }
      return null;
    }
  }
}

export function getListSubFieldErrors(
  listField: ListField,
  listValue: FormValue | undefined,
  data: Record<string, FormValue>,
  extras: ConditionExtras = {},
): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  const listVal = Array.isArray(listValue) ? listValue : [];
  const listValTyped = listVal.every(
    (item): item is Record<string, FormValue> =>
      item !== null && typeof item === "object" && !Array.isArray(item),
  )
    ? listVal
    : [];
  const subFields = listField.fields ?? [];
  for (let cardIndex = 0; cardIndex < listValTyped.length; cardIndex++) {
    const card = listValTyped[cardIndex] ?? {};
    const mergedData = { ...data, ...card };
    for (const sub of subFields) {
      const key = `${listField.id}:${cardIndex}:${sub.id}`;
      if (!isElementCurrentlyVisible(sub, mergedData, extras)) {
        result[key] = null;
        continue;
      }
      const subValue = card[sub.id];
      const subError = validateFieldValue(sub, subValue, mergedData, extras);
      result[key] = subError;
    }
  }
  return result;
}
