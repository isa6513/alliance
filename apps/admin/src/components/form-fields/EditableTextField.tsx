import type { TextField } from "@alliance/shared/forms/formschema";
import {
  ConditionalVisibility,
  RequiredAsterisk,
  RequiredToggle,
} from "./CommonControls";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps } from "./types";

export function EditableTextField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseFieldProps<TextField<string>>) {
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

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Placeholder Text
            </label>
            <input
              type="text"
              value={field.placeholder || ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter placeholder text"
            />
          </div>

          <div className="flex items-center space-x-4">
            <RequiredToggle
              checked={field.required}
              onChange={(checked) => onUpdate({ required: checked })}
            />

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
          <input
            type="text"
            placeholder={field.placeholder || "Enter text..."}
            maxLength={field.maxLength}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
