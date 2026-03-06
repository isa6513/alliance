import type {
  AnyField,
  FieldKind,
  ListField,
} from "@alliance/shared/forms/formschema";
import { FieldLabelEditor } from "./FieldLabelEditor";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps } from "./types";
import { EditableCheckboxField } from "./EditableCheckboxField";
import { EditableChoiceField } from "./EditableChoiceField";
import { EditableCityField } from "./EditableCityField";
import { EditableDateField } from "./EditableDateField";
import { EditableEmailField } from "./EditableEmailField";
import { EditableFileField } from "./EditableFileField";
import { EditableNumberField } from "./EditableNumberField";
import { EditablePhoneField } from "./EditablePhoneField";
import { EditableRangeField } from "./EditableRangeField";
import { EditableTextField } from "./EditableTextField";
import { EditableTextareaField } from "./EditableTextareaField";
import { EditableTimeField } from "./EditableTimeField";
import { EditableTimezoneField } from "./EditableTimezoneField";

const SUB_FIELD_KINDS_OPTIONS = {
  textarea: true,
  number: true,
  email: true,
  phone: true,
  checkbox: true,
  radio: true,
  select: true,
  multiselect: true,
  date: true,
  time: true,
  timezone: true,
  city: true,
  file: true,
  range: true,
} as const satisfies Record<
  Exclude<FieldKind, "list" | "contract" | "custom" | "text">,
  unknown
>;
type SubFieldKind = keyof typeof SUB_FIELD_KINDS_OPTIONS;

const SUB_FIELD_KINDS = Object.keys(SUB_FIELD_KINDS_OPTIONS) as SubFieldKind[];

function createDefaultSubField(parentId: string, kind: SubFieldKind): AnyField {
  const id = `${parentId}-sub-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
  const base = {
    id,
    kind,
    label: `${kind.charAt(0).toUpperCase() + kind.slice(1)}`,
    required: false,
  };
  switch (kind) {
    case "textarea":
      return { ...base, kind: "textarea", rows: 1 };
    case "number":
      return { ...base, kind: "number" };
    case "email":
      return { ...base, kind: "email" };
    case "phone":
      return { ...base, kind: "phone", placeholder: "Enter phone number" };
    case "checkbox":
      return { ...base, kind: "checkbox" };
    case "radio":
      return {
        ...base,
        kind: "radio",
        options: [{ label: "Option 1", value: "option1" }],
      };
    case "select":
      return {
        ...base,
        kind: "select",
        options: [{ label: "Option 1", value: "option1" }],
      };
    case "multiselect":
      return {
        ...base,
        kind: "multiselect",
        options: [{ label: "Option 1", value: "option1" }],
      };
    case "date":
      return { ...base, kind: "date" };
    case "time":
      return { ...base, kind: "time" };
    case "timezone":
      return {
        ...base,
        kind: "timezone",
        defaultValue: "America/Los_Angeles",
      };
    case "city":
      return { ...base, kind: "city", placeholder: "Search for a city" };
    case "file":
      return { ...base, kind: "file" };
    case "range":
      return {
        ...base,
        kind: "range",
        optionCount: 10,
        startLabel: "",
        endLabel: "",
      };
    default:
      kind satisfies never;
      return { ...base, kind: "textarea", rows: 1 };
  }
}

function renderEditableSubField(
  sub: AnyField,
  index: number,
  updateSubField: (index: number, updates: Partial<AnyField>) => void,
  removeSubField: (index: number) => void,
  previousFields: AnyField[]
) {
  const commonProps = {
    field: sub as never,
    onUpdate: (updates: Partial<AnyField>) => updateSubField(index, updates),
    onRemove: () => removeSubField(index),
    previousFields,
    onDragStart: undefined,
    onDragEnd: undefined,
    isDragging: false,
  };
  switch (sub.kind) {
    case "text":
      return <EditableTextField {...commonProps} />;
    case "textarea":
      return <EditableTextareaField {...commonProps} />;
    case "email":
      return <EditableEmailField {...commonProps} />;
    case "phone":
      return <EditablePhoneField {...commonProps} />;
    case "number":
      return <EditableNumberField {...commonProps} />;
    case "range":
      return <EditableRangeField {...commonProps} />;
    case "checkbox":
      return <EditableCheckboxField {...commonProps} />;
    case "radio":
    case "select":
    case "multiselect":
      return <EditableChoiceField {...commonProps} />;
    case "date":
      return <EditableDateField {...commonProps} />;
    case "time":
      return <EditableTimeField {...commonProps} />;
    case "timezone":
      return <EditableTimezoneField {...commonProps} />;
    case "city":
      return <EditableCityField {...commonProps} />;
    case "file":
      return <EditableFileField {...commonProps} />;
    default:
      return null;
  }
}

export function EditableListField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseFieldProps<ListField>) {
  const addSubField = (kind: (typeof SUB_FIELD_KINDS)[number]) => {
    const sub = createDefaultSubField(field.id, kind);
    onUpdate({ fields: [...(field.fields ?? []), sub] });
  };

  const updateSubField = (index: number, updates: Partial<AnyField>) => {
    const next = [...(field.fields ?? [])];
    next[index] = { ...next[index], ...updates } as AnyField;
    onUpdate({ fields: next });
  };

  const removeSubField = (index: number) => {
    const next = (field.fields ?? []).filter((_, i) => i !== index);
    onUpdate({ fields: next });
  };

  const subFields = field.fields ?? [];
  const previousFieldsFor = (index: number) => subFields.slice(0, index);

  return (
    <FieldWrapper
      field={field}
      onUpdate={onUpdate}
      previousFields={previousFields}
      onRemove={onRemove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
    >
      <FieldLabelEditor
        value={field.label}
        onChange={(v) => onUpdate({ label: v })}
      />

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          “Add item” button text
        </label>
        <input
          type="text"
          value={field.addButtonLabel ?? ""}
          onChange={(e) =>
            onUpdate({ addButtonLabel: e.target.value || undefined })
          }
          placeholder="e.g. Add item (leave blank for default)"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-gray-700 mb-1">
            Default number of cards
          </label>
          <input
            type="number"
            value={field.defaultNumber ?? 0}
            onChange={(e) =>
              onUpdate({
                defaultNumber: e.target.value
                  ? parseInt(e.target.value, 10)
                  : 0,
              })
            }
            min={0}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">Min cards</label>
          <input
            type="number"
            value={field.min ?? 0}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : 0;
              onUpdate({
                min: value,
                required: value > 0,
              });
            }}
            min={0}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">Max cards</label>
          <input
            type="number"
            value={field.max ?? ""}
            onChange={(e) =>
              onUpdate({
                max: e.target.value ? parseInt(e.target.value, 10) : undefined,
              })
            }
            min={0}
            placeholder="No limit"
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Fields in each card
        </label>
        <div className="space-y-3">
          {subFields.map((sub, index) => (
            <div key={sub.id}>
              {renderEditableSubField(
                sub,
                index,
                updateSubField,
                removeSubField,
                previousFieldsFor(index)
              )}
            </div>
          ))}
          <div className="relative">
            <select
              value=""
              onChange={(e) => {
                const k = e.target.value as (typeof SUB_FIELD_KINDS)[number];
                if (k) addSubField(k);
                e.target.value = "";
              }}
              className="w-full px-2 py-1.5 text-sm border border-dashed border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none pr-8"
            >
              <option value="">+ Add field to card</option>
              {SUB_FIELD_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              +
            </span>
          </div>
        </div>
      </div>
    </FieldWrapper>
  );
}
