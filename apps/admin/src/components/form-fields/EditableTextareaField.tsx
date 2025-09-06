import type { TextareaField } from "@alliance/shared/forms/formschema";
import { FieldWrapper } from "./FieldWrapper";
import { RequiredAsterisk, RequiredToggle, ConditionalVisibility } from "./CommonControls";
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
        <div className="bg-gray-50 p-3 rounded-md space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Field Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter field label"
            />
          </div>

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
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {field.label}
            <RequiredAsterisk required={!!field.required} />
          </label>
          <textarea
            rows={field.rows || 3}
            maxLength={field.maxLength}
            placeholder="Enter your text here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled
          />
          {field.maxLength && (
            <p className="text-xs text-gray-500 mt-1">
              Maximum {field.maxLength} characters
            </p>
          )}
        </div>
      </div>
    </FieldWrapper>
  );
}
