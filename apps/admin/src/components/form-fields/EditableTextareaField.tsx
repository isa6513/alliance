import type { TextareaField } from "@alliance/shared/forms/formschema";
import RenderField from "@alliance/shared/forms/RenderField";
import { ConditionalVisibility, RequiredToggle } from "./CommonControls";
import { FieldLabelEditor } from "./FieldLabelEditor";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps } from "./types";

export function EditableTextareaField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseFieldProps<TextareaField<string>>) {
  return (
    <FieldWrapper
      onRemove={onRemove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
    >
      <div className="space-y-3">
        {/* Field Configuration */}
        <div className="bg-gray-100 p-3 rounded-md space-y-2">
          <FieldLabelEditor
            value={field.label}
            onChange={(v) => onUpdate({ label: v })}
          />

          <div className="flex items-center space-x-4">
            <RequiredToggle
              checked={field.required}
              onChange={(checked) => onUpdate({ required: checked })}
            />

            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-700">Rows:</label>
              <input
                type="number"
                value={field.rows || 3}
                onChange={(e) =>
                  onUpdate({ rows: parseInt(e.target.value) || 3 })
                }
                className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="1"
                max="20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-700">Max Length:</label>
              <input
                type="number"
                value={field.maxLength || ""}
                onChange={(e) =>
                  onUpdate({
                    maxLength: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>

          <ConditionalVisibility
            field={field}
            previousFields={previousFields || []}
            onChange={onUpdate}
          />
        </div>

        {/* Field Preview */}
        <div>
          <RenderField field={field} disabled />
        </div>
      </div>
    </FieldWrapper>
  );
}
