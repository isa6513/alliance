import type { TimezoneField } from "@alliance/shared/forms/formschema";
import { RequiredToggle } from "./CommonControls";
import { FieldLabelEditor } from "./FieldLabelEditor";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps } from "./types";

export function EditableTimezoneField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseFieldProps<TimezoneField>) {
  const regionFilter = field.regionFilter?.join(", ") ?? "";

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

      <RequiredToggle
        checked={field.required}
        onChange={(checked) => onUpdate({ required: checked })}
      />

      <label className="flex flex-col space-y-1 text-xs text-gray-700">
        <span className="font-medium">
          Limit to regions (comma-separated, optional)
        </span>
        <input
          type="text"
          value={regionFilter}
          onChange={(e) => {
            const raw = e.target.value;
            const regions = raw
              .split(",")
              .map((region) => region.trim())
              .filter(Boolean);
            onUpdate({
              regionFilter: regions.length > 0 ? regions : undefined,
            });
          }}
          placeholder="America, Europe"
          className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </label>
    </FieldWrapper>
  );
}
