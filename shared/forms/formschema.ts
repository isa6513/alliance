/* eslint-disable @typescript-eslint/no-explicit-any */

import type { DisplayBlock } from "./display-blocks";

// field-kinds.ts
export type FieldKind =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "phone"
  | "checkbox"
  | "radio"
  | "select"
  | "multiselect"
  | "date"
  | "file";

type Option<V extends string = string> = { label: string; value: V };

// For strong typing of answers, each field carries a phantom _value type:
interface BaseField<TKind extends FieldKind, TId extends string, TValue> {
  id: TId;
  kind: TKind;
  label: string;
  description?: string;
  required?: boolean; // compile-time required inference
  defaultValue?: TValue | null;

  // simple conditions: strongly-typed references to other fields' values
  visibleIf?: Condition<TId>;
  requiredIf?: Condition<TId>;

  // UI hints
  width?: "full" | "1/2" | "1/3";

  // Phantom type that never exists at runtime but lets TS track the answer type:
  /** @internal */
  _value?: TValue;
}

// Conditions reference other field ids; we type this late with a helper (see defineForm)
export type Condition<_ScopedId extends string> =
  | { when: _ScopedId; equals: string | number | boolean | null }
  | { expr: string }; // keep an escape hatch; runtime-evaluated safely

// Specialized fields:

export type TextField<TId extends string> = BaseField<"text", TId, string> & {
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // regex string (runtime checked)
};

export type TextareaField<TId extends string> = BaseField<
  "textarea",
  TId,
  string
> & {
  rows?: number;
  maxLength?: number;
};

export type EmailField<TId extends string> = BaseField<"email", TId, string>;
export type PhoneField<TId extends string> = BaseField<"phone", TId, string> & {
  placeholder?: string;
  pattern?: string;
};
export type NumberField<TId extends string> = BaseField<
  "number",
  TId,
  number
> & {
  min?: number;
  max?: number;
  step?: number;
};

export type CheckboxField<TId extends string> = BaseField<
  "checkbox",
  TId,
  boolean
>;
export type RadioField<TId extends string, V extends string> = BaseField<
  "radio",
  TId,
  V
> & { options: Option<V>[] };

export type SelectField<TId extends string, V extends string> = BaseField<
  "select",
  TId,
  V
> & { options: Option<V>[] };

export type MultiSelectField<TId extends string, V extends string> = BaseField<
  "multiselect",
  TId,
  V[]
> & { options: Option<V>[] };

export type DateField<TId extends string> = BaseField<"date", TId, string>; // ISO date string
export type FileField<TId extends string> = BaseField<
  "file",
  TId,
  { name: string; file: File }
>;

export type AnyField<TId extends string = string> =
  | TextField<TId>
  | TextareaField<TId>
  | EmailField<TId>
  | PhoneField<TId>
  | NumberField<TId>
  | CheckboxField<TId>
  | RadioField<TId, string>
  | SelectField<TId, string>
  | MultiSelectField<TId, string>
  | DateField<TId>
  | FileField<TId>;

export interface Page<TFieldIds extends string> {
  id: string;
  title?: string;
  description?: string;
  /** Now accepts answer fields OR display blocks */
  fields: Array<AnyField<TFieldIds> | DisplayBlock<TFieldIds>>;
}

export interface FormSchema<TSlug extends string, TFieldIds extends string> {
  slug: TSlug;
  version: number;
  title: string;
  description?: string;
  pages: Page<TFieldIds>[];
  submit?: { label?: string };
}

// -------- utilities (updated) --------

// All nodes in a schema (fields or blocks)
type NodesOf<S extends FormSchema<any, any>> =
  S["pages"][number]["fields"][number];

// Only the answer fields:
type AnswerFieldsOf<S extends FormSchema<any, any>> = Extract<
  NodesOf<S>,
  AnyField<any>
>;

// Set of field IDs (answers only)
export type IdsOf<S extends FormSchema<any, any>> = AnswerFieldsOf<S>["id"];

// Required IDs (answers only)
type RequiredIdsOf<S extends FormSchema<any, any>> =
  AnswerFieldsOf<S> extends infer F
    ? F extends AnyField<any>
      ? F["required"] extends true
        ? F["id"]
        : never
      : never
    : never;

// Optional IDs = everything else (answers only)
type OptionalIdsOf<S extends FormSchema<any, any>> = Exclude<
  IdsOf<S>,
  RequiredIdsOf<S>
>;

export type FieldValue<F extends AnyField<any>> = NonNullable<F["_value"]>;

// Response type derived from **answer fields only**
export type ResponseOf<S extends FormSchema<any, any>> = {
  [K in RequiredIdsOf<S>]: Extract<AnswerFieldsOf<S>, { id: K }> extends infer F
    ? F extends AnyField<any>
      ? FieldValue<F>
      : never
    : never;
} & {
  [K in OptionalIdsOf<S>]?: Extract<
    AnswerFieldsOf<S>,
    { id: K }
  > extends infer F
    ? F extends AnyField<any>
      ? FieldValue<F>
      : never
    : never;
};

// defineForm unchanged:
export function defineForm<const S extends FormSchema<string, string>>(
  schema: S
) {
  return schema;
}
