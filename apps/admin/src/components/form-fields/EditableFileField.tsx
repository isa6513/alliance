import type { FileField } from "@alliance/shared/forms/formschema";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps } from "./types";

export function EditableFileField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
}: BaseFieldProps<FileField<string>>) {
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
        </div>

        {/* Field Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <input
              type="file"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Files will be uploaded on form submission
          </p>
        </div>
      </div>
    </FieldWrapper>
  );
}
