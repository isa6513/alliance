import type { CitySearchDto } from "../client";
import type { DisplayBlock, ManualDisplayBlockContent } from "./display-blocks";

// field-kinds.ts
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
  | "custom";

type Option<V extends string = string> = { label: string; value: V };

// Unified value type for answers (persisted)
export type CityFieldValue = CitySearchDto;
export type FormValue = string | number | boolean | string[] | CityFieldValue;

export const DEVICE_VISIBILITY_TARGETS = [
  "mobile",
  "tablet",
  "desktop",
] as const;
export type DeviceVisibilityTarget = (typeof DEVICE_VISIBILITY_TARGETS)[number];

export interface FieldOutputConfig {
  output?: boolean;
}

// Base field for dynamic forms (no generics, runtime-first)
interface BaseField<TKind extends FieldKind> {
  id: string;
  kind: TKind;
  label: string | null;
  description?: string;
  required?: boolean;
  defaultValue?: FormValue | null;
  customValidatorId?: number;

  // simple conditions using string IDs
  visibleIf?: Condition[];
  requiredIf?: Condition;

  // UI hints
  width?: "full" | "1/2" | "1/3";

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

// Specialized fields:

export type TextField = BaseField<"text"> & {
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // regex string (runtime checked)
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

// Field kinds that support auto-extraction into user data
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

export type DateField = BaseField<"date">; // ISO date string (YYYY-MM-DD)
export type TimeField = BaseField<"time"> & {
  autoExtractUserData?: boolean;
}; // Stored as HH:mm (24h) string
export type TimezoneField = BaseField<"timezone"> & {
  autoExtractUserData?: boolean;
};
export type CityField = BaseField<"city"> & {
  placeholder?: string;
  minLength?: number;
  debounceMs?: number;
  autoExtractUserData?: boolean;
};
// Persist file answers as string URL/key
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

export interface FormSchema {
  title: string;
  description?: string;
  pages: Page[];
  submit?: { label?: string };

  outputViews: OutputViewSchema[];
}

export type OutputBlock = DisplayBlock | OutputFieldBlock;

export interface OutputFieldBlock {
  id: string;
  fieldId: string;
  showLabel?: boolean;
  labelOverride?: string;
  format?: "field" | "textonly" | "card";
  visibleIf?: Condition[];
}

export interface OutputViewSchema {
  type: "default" | "page" | "card" | "personal";
  id: string;
  title?: string;
  description?: string;
  blocks: OutputBlock[];
}
