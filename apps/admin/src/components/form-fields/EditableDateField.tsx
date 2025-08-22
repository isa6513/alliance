import type { DateField } from "@alliance/shared/lib/formschema";
import type { BaseFieldProps } from "./types";
import { FieldWrapper } from "./FieldWrapper";

export function EditableDateField({ field, onUpdate, onRemove, onDragStart, onDragEnd, isDragging }: BaseFieldProps<DateField<string>>) {
  return (
    <FieldWrapper onRemove={onRemove} onDragStart={onDragStart} onDragEnd={onDragEnd} isDragging={isDragging}>
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
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled
          />
        </div>
      </div>
    </FieldWrapper>
  );
}