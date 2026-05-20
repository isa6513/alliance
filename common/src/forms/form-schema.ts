import type { DisplayBlock, ManualDisplayBlockContent } from "./display-blocks";
import type { Condition, VisibleIfFormula } from "./visible-if-formula";

export type {
  Condition,
  FormulaNode,
  VisibleIfFormula
} from "./visible-if-formula";

/** City answer shape; matches API `CitySearchDto` / server `CitySearchDto` structurally. */
export interface CityFieldValue {
  id: number;
  name: string;
  admin1: string;
  countryCode: string;
  countryName: string;
}

export type FieldKind =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "range"
  | "phone"
  | "checkbox"
  | "radio"
  | "select"
  | "multiselect"
  | "date"
  | "time"
  | "timezone"
  | "file"
  | "city"
  | "contract"
  | "list"
  | "custom";

type Option<V extends string = string> = { label: string; value: V };

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

interface BaseField<TKind extends FieldKind> {
  id: string;
  kind: TKind;
  label: string | null;
  description?: string;
  required?: boolean;
  defaultValue?: FormValue | null;
  customValidatorId?: number;

  visibleIfFormula?: VisibleIfFormula;
  requiredIf?: Condition;

  width?: "full" | "1/2" | "1/3";

  output?: FieldOutputConfig;
}

export type TextField = BaseField<"text"> & {
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

export type TextareaField = BaseField<"textarea"> & {
  rows?: number;
  maxLength?: number;
  placeholder?: string;
};

export type EmailField = BaseField<"email">;
export type PhoneField = BaseField<"phone"> & {
  placeholder?: string;
  pattern?: string;
  autoExtractUserData?: boolean;
};
export type NumberField = BaseField<"number"> & {
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
  decimalPlaces?: number;
};
export type RangeField = BaseField<"range"> & {
  optionCount?: number;
  startLabel?: string;
  endLabel?: string;
};

export type CheckboxExtractionTarget = "shareInfoPublicly";
export type CheckboxPosition = "left" | "right";

export type CheckboxField = BaseField<"checkbox"> & {
  autoExtractUserData?: { target: CheckboxExtractionTarget };
  checkboxPosition?: CheckboxPosition;
};

export const AUTO_EXTRACT_FIELD_KINDS = [
  "phone",
  "time",
  "timezone",
  "city",
  "checkbox",
  "custom",
] as const;
export type AutoExtractFieldKind = (typeof AUTO_EXTRACT_FIELD_KINDS)[number];

export type RadioField = BaseField<"radio"> & {
  options: Option<string>[];
  randomizeOptions?: boolean;
};

export type SelectField = BaseField<"select"> & {
  options: Option<string>[];
  randomizeOptions?: boolean;
};

export type MultiSelectField = BaseField<"multiselect"> & {
  options: Option<string>[];
  randomizeOptions?: boolean;
  maxSelections?: number;
};

export type DateField = BaseField<"date">;
export type TimeField = BaseField<"time"> & {
  autoExtractUserData?: boolean;
};
export type TimezoneField = BaseField<"timezone"> & {
  autoExtractUserData?: boolean;
};
export type CityField = BaseField<"city"> & {
  placeholder?: string;
  minLength?: number;
  debounceMs?: number;
  autoExtractUserData?: boolean;
};
export type ContractField = BaseField<"contract"> & {
  contractId: number | null;
  contract?: { id: number; markdown: string };
  signQuestion: string;
  yesLabel: string;
  noLabel: string;
};
export type ListField = BaseField<"list"> & {
  fields: AnyField[];
  defaultNumber?: number;
  min?: number;
  max?: number;
  addButtonLabel?: string;
  /** Sub-field ids to hide when rendering this list in an output view. */
  outputViewHiddenFieldIds?: string[];
  /** Prefill this list's cards from a previous form's list field answer. */
  prefillFromPreviousAnswer?: {
    sourceFormId: number;
    sourceFieldId: string;
    sourceSubFieldId: string;
    targetSubFieldId: string;
  };
};
export type FileField = BaseField<"file">;
export type CustomComponentField = BaseField<"custom"> & {
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

export interface Page {
  id: string;
  title?: string;
  description?: string;
  fields: Array<AnyField | DisplayBlock>;
}

export type ManualDisplayBlockContentMap = Record<
  string,
  ManualDisplayBlockContent
>;

export type AggregateViewValue =
  | { type: "number"; value: number }
  | { type: "numberfield"; fieldId: string; value?: number };

export type AggregateViewDisplayType = "number" | "dollars";

export interface AggregateProgressBarView {
  kind: "progressbar";
  id: string;
  title: string;
  caption: string;
  numerator: AggregateViewValue;
  denominator: AggregateViewValue;
  displayType: AggregateViewDisplayType;
}

export type AggregateViewSchema = AggregateProgressBarView;

export interface FormSchema {
  title: string;
  description?: string;
  pages: Page[];
  submit?: { label?: string };
  shareableTextTemplate?: string;
  defaultShareableTextTemplate?: string;

  outputViews: OutputViewSchema[];
  aggregateViews?: AggregateViewSchema[];
}

export type OutputBlock = DisplayBlock | OutputFieldBlock;

export interface OutputFieldBlock {
  id: string;
  fieldId: string;
  showLabel?: boolean;
  labelOverride?: string;
  format?: "field" | "textonly" | "card";
  visibleIfFormula?: VisibleIfFormula;
}

export interface OutputViewSchema {
  type: "default" | "page" | "card" | "personal";
  id: string;
  title?: string;
  description?: string;
  blocks: OutputBlock[];
}

export function isQuestionField(
  field: AnyField | DisplayBlock,
): field is AnyField {
  return "label" in field;
}

/** Scan a form schema for all sourceFormIds referenced in visibility conditions. */
export function collectSourceFormIds(schema: FormSchema): number[] {
  const ids = new Set<number>();
  const collectFromCondition = (c: Condition) => {
    if ("sourceFormId" in c && typeof c.sourceFormId === "number") {
      ids.add(c.sourceFormId);
    }
  };
  const collectFromElement = (el: AnyField | DisplayBlock) => {
    if (el.visibleIfFormula?.conditions) {
      Object.values(el.visibleIfFormula.conditions).forEach(
        collectFromCondition,
      );
    }
    if ("requiredIf" in el && (el as AnyField).requiredIf) {
      collectFromCondition((el as AnyField).requiredIf!);
    }
  };
  for (const page of schema.pages) {
    for (const field of page.fields) {
      collectFromElement(field);
      if (isQuestionField(field) && field.kind === "list") {
        for (const sub of (field as ListField).fields ?? []) {
          collectFromElement(sub);
        }
      }
    }
  }
  return Array.from(ids);
}
