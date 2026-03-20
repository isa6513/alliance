import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CitySearchDto } from 'src/geo/city.dto';
import type { DisplayBlock } from './display-blocks';
import type { DeviceVisibilityTarget } from './form-schema/v0/device';

// field-kinds.ts
export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'range'
  | 'phone'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'time'
  | 'timezone'
  | 'file'
  | 'city'
  | 'contract'
  | 'list'
  | 'custom';

type Option<V extends string = string> = { label: string; value: V };

// Unified value type for answers (persisted)
export type CityFieldValue = CitySearchDto;
export type ListFieldValue = Record<string, FormValue>[];
export type FormValue =
  | string
  | number
  | boolean
  | string[]
  | CityFieldValue
  | ListFieldValue;

export interface FieldOutputConfig {
  output?: boolean;
  privateByDefault?: boolean;
}

// Base field for dynamic forms (no generics, runtime-first)
interface BaseField<TKind extends FieldKind> {
  id: string;
  kind: TKind;
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: FormValue | null;
  customValidatorId?: number;

  // simple conditions using string IDs
  /** @deprecated Use visibleIfFormula. */
  visibleIf?: Condition[];
  visibleIfFormula?: VisibleIfFormula;
  requiredIf?: Condition;

  // UI hints
  width?: 'full' | '1/2' | '1/3';

  output?: FieldOutputConfig;
}

// Conditions reference other field ids; we type this late with a helper (see defineForm)
export type Condition =
  | { when: string; equals: string | number | boolean | null }
  | { when: string; includesOption: string }
  | { when: string; anySelected: boolean }
  | { when: string; hasValue: boolean }
  | { expr: string }
  | { validatorId: number; resultEquals?: boolean } // validators default to expecting true
  | { deviceType: DeviceVisibilityTarget[] };

/** Formula tree for visibility: AND/OR of two operands, NOT of one. Leaves are condition names. */
export type FormulaNode =
  | { op: 'AND'; left: FormulaNode | string; right: FormulaNode | string }
  | { op: 'OR'; left: FormulaNode | string; right: FormulaNode | string }
  | { op: 'NOT'; operand: FormulaNode | string }
  | string;

export interface VisibleIfFormula {
  conditions: Record<string, Condition>;
  formula: FormulaNode;
}

// Specialized fields:

export type TextField = BaseField<'text'> & {
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // regex string (runtime checked)
};

export type TextareaField = BaseField<'textarea'> & {
  rows?: number;
  maxLength?: number;
  placeholder?: string;
};

export type EmailField = BaseField<'email'>;
export type PhoneField = BaseField<'phone'> & {
  placeholder?: string;
  pattern?: string;
  autoExtractUserData?: boolean;
};
export type NumberField = BaseField<'number'> & {
  min?: number;
  max?: number;
  step?: number;
};
export type RangeField = BaseField<'range'> & {
  optionCount?: number;
  startLabel?: string;
  endLabel?: string;
};

export type CheckboxExtractionTarget = 'shareInfoPublicly';
export type CheckboxPosition = 'left' | 'right';

export type CheckboxField = BaseField<'checkbox'> & {
  autoExtractUserData?: { target: CheckboxExtractionTarget };
  checkboxPosition?: CheckboxPosition;
};
export type RadioField = BaseField<'radio'> & {
  options: Option<string>[];
  randomizeOptions?: boolean;
};

export type SelectField = BaseField<'select'> & {
  options: Option<string>[];
  randomizeOptions?: boolean;
};

export type MultiSelectField = BaseField<'multiselect'> & {
  options: Option<string>[];
  randomizeOptions?: boolean;
  maxSelections?: number;
};

export type DateField = BaseField<'date'>; // ISO date string (YYYY-MM-DD)
export type TimeField = BaseField<'time'> & {
  autoExtractUserData?: boolean;
}; // Stored as HH:mm (24h) string
export type TimezoneField = BaseField<'timezone'> & {
  autoExtractUserData?: boolean;
};
export type CityField = BaseField<'city'> & {
  placeholder?: string;
  minLength?: number;
  debounceMs?: number;
  autoExtractUserData?: boolean;
};
export type ContractField = BaseField<'contract'> & {
  contractId: number | null;
  contract?: {
    id: number;
    markdown: string;
  };
  signQuestion: string;
  yesLabel: string;
  noLabel: string;
};
export type ListField = BaseField<'list'> & {
  fields: AnyField[];
  defaultNumber?: number;
  min?: number;
  max?: number;
  addButtonLabel?: string;
  outputViewHiddenFieldIds?: string[];
};
// Persist file answers as string URL/key
export type FileField = BaseField<'file'>;
export type CustomComponentField = BaseField<'custom'> & {
  componentId: string;
  componentConfig?: Record<string, unknown>;
  autoExtractUserData?: { target: CheckboxExtractionTarget };
};

export type AnyField =
  | TextField
  | TextareaField
  | EmailField
  | PhoneField
  | NumberField
  | RangeField
  | CheckboxField
  | RadioField
  | SelectField
  | MultiSelectField
  | DateField
  | TimeField
  | TimezoneField
  | CityField
  | FileField
  | ContractField
  | ListField
  | CustomComponentField;

export class Page {
  id: string;
  title?: string;
  description?: string;
  fields: Array<AnyField | DisplayBlock>;
}

export type AggregateViewValue =
  | { type: 'number'; value: number }
  | { type: 'numberfield'; fieldId: string; value?: number };

export type AggregateViewDisplayType = 'number' | 'dollars';

export interface AggregateProgressBarView {
  kind: 'progressbar';
  id: string;
  title: string;
  caption: string;
  numerator: AggregateViewValue;
  denominator: AggregateViewValue;
  displayType: AggregateViewDisplayType;
}

export type AggregateViewSchema = AggregateProgressBarView;

export class FormSchema {
  @ApiProperty()
  title: string;
  @ApiPropertyOptional()
  description?: string;
  @ApiProperty({ type: Page, isArray: true })
  pages: Page[];
  @ApiPropertyOptional()
  submit?: { label?: string };

  outputViews: OutputViewSchema[];
  aggregateViews?: AggregateViewSchema[];
}

export type OutputBlock = DisplayBlock | OutputFieldBlock;

export interface OutputFieldBlock {
  id: string;
  fieldId: string;
  showLabel?: boolean;
  labelOverride?: string;
  format?: 'field' | 'textonly' | 'card';
  /** @deprecated Use visibleIfFormula. */
  visibleIf?: Condition[];
  visibleIfFormula?: VisibleIfFormula;
}

export interface OutputViewSchema {
  type: 'default' | 'page' | 'card' | 'personal';
  id: string;
  title?: string;
  description?: string;
  blocks: OutputBlock[];
}

export function isQuestionField(
  field: AnyField | DisplayBlock,
): field is AnyField {
  return 'label' in field;
}

function evaluateVisibilityFormulaNode(
  node: FormulaNode,
  results: Record<string, boolean>,
): boolean {
  if (typeof node === 'string') return results[node] === true;
  if (node.op === 'NOT') {
    const operand =
      typeof node.operand === 'string'
        ? results[node.operand] === true
        : evaluateVisibilityFormulaNode(node.operand, results);
    return !operand;
  }
  const left =
    typeof node.left === 'string'
      ? results[node.left] === true
      : evaluateVisibilityFormulaNode(node.left, results);
  const right =
    typeof node.right === 'string'
      ? results[node.right] === true
      : evaluateVisibilityFormulaNode(node.right, results);
  return node.op === 'AND' ? left && right : left || right;
}

export function isQuestionVisible(
  element: AnyField | DisplayBlock,
  formData: Record<string, FormValue>,
  validatorResults?: Record<number, boolean>,
  deviceType?: DeviceVisibilityTarget,
): boolean {
  const normalizedDeviceType: DeviceVisibilityTarget = deviceType ?? 'desktop';
  const hasContent = (value: FormValue | undefined): boolean => {
    if (value === undefined || value === null) {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  };
  const evalCond = (c: Condition): boolean => {
    if ('expr' in c) return true;
    if ('deviceType' in c) {
      if (!Array.isArray(c.deviceType) || c.deviceType.length === 0)
        return false;
      return c.deviceType.includes(normalizedDeviceType);
    }
    if ('validatorId' in c) {
      const expected = c.resultEquals ?? true;
      const actual = validatorResults?.[c.validatorId];
      if (actual === undefined) return false;
      return actual === expected;
    }
    const val = formData[c.when];
    if ('hasValue' in c) {
      const present = hasContent(val as FormValue | undefined);
      return c.hasValue ? present : !present;
    }
    if ('anySelected' in c) {
      const selections = Array.isArray(val) ? val : [];
      return c.anySelected ? selections.length > 0 : selections.length === 0;
    }
    if ('includesOption' in c) {
      if (!c.includesOption) return false;
      return (
        Array.isArray(val) &&
        val.length > 0 &&
        typeof val[0] === 'string' &&
        (val as string[]).includes(c.includesOption)
      );
    }
    if (!('equals' in c)) return true;
    if (typeof c.equals === 'boolean') return Boolean(val) === c.equals;
    if (typeof c.equals === 'number' && Number.isFinite(c.equals)) {
      if (val === '' || val === undefined || val === null) return false;
      if (typeof val === 'number' && Number.isFinite(val))
        return val === c.equals;
      if (typeof val === 'string' && val.trim() !== '') {
        const n = Number(val);
        return Number.isFinite(n) && n === c.equals;
      }
      return false;
    }
    if (Array.isArray(val) && c.equals !== null && c.equals !== undefined) {
      if (val.length > 0 && typeof val[0] === 'string') {
        return (val as string[]).includes(c.equals as string);
      }
      return false;
    }
    return val === c.equals;
  };

  const formula = element.visibleIfFormula;
  if (
    formula?.conditions &&
    Object.keys(formula.conditions).length > 0 &&
    formula.formula
  ) {
    const results: Record<string, boolean> = {};
    for (const [name, cond] of Object.entries(formula.conditions)) {
      results[name] = evalCond(cond);
    }
    return evaluateVisibilityFormulaNode(formula.formula, results);
  }

  const raw = element.visibleIf;
  if (raw && (Array.isArray(raw) ? raw.length > 0 : true)) {
    const conditions = Array.isArray(raw) ? raw : [raw];
    for (const condition of conditions) {
      if (!evalCond(condition)) return false;
    }
  }
  return true;
}
