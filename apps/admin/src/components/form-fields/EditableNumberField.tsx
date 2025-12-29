import type { NumberField } from "@alliance/sharedweb/forms/formschema";
import { RequiredToggle } from "./CommonControls";
import { FieldLabelEditor } from "./FieldLabelEditor";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps } from "./types";

export function EditableNumberField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseFieldProps<NumberField>) {
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

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-gray-700 mb-1">Min Value</label>
          <input
            type="number"
            value={field.min ?? ""}
            onChange={(e) =>
              onUpdate({
                min: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Min"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">Max Value</label>
          <input
            type="number"
            value={field.max ?? ""}
            onChange={(e) =>
              onUpdate({
                max: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Max"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">Step</label>
          <input
            type="number"
            value={field.step ?? ""}
            onChange={(e) =>
              onUpdate({
                step: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="1"
            step="any"
          />
        </div>
      </div>
    </FieldWrapper>
  );
}
