import type { NumberField } from "@alliance/shared/forms/formschema";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps } from "./types";

export function EditableNumberField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
}: BaseFieldProps<NumberField<string>>) {
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
            <label className="flex items-center text-xs text-gray-700">
              <input
                type="checkbox"
                checked={field.required || false}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="mr-1"
              />
              Required
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Min Value
              </label>
              <input
                type="number"
                value={field.min || ""}
                onChange={(e) =>
                  onUpdate({
                    min: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Max Value
              </label>
              <input
                type="number"
                value={field.max || ""}
                onChange={(e) =>
                  onUpdate({
                    max: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
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
                value={field.step || ""}
                onChange={(e) =>
                  onUpdate({
                    step: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="1"
                step="any"
              />
            </div>
          </div>
        </div>

        {/* Field Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="number"
            min={field.min}
            max={field.max}
            step={field.step || 1}
            placeholder="Enter number..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled
          />
          {(field.min !== undefined || field.max !== undefined) && (
            <p className="text-xs text-gray-500 mt-1">
              {field.min !== undefined && field.max !== undefined
                ? `Range: ${field.min} - ${field.max}`
                : field.min !== undefined
                ? `Minimum: ${field.min}`
                : `Maximum: ${field.max}`}
            </p>
          )}
        </div>
      </div>
    </FieldWrapper>
  );
}
