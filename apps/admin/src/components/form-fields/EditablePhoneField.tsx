import type { PhoneField } from "@alliance/shared/forms/formschema";
import { FieldWrapper } from "./FieldWrapper";
import { RequiredAsterisk, RequiredToggle, ConditionalVisibility } from "./CommonControls";
import type { BaseFieldProps } from "./types";

export function EditablePhoneField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseFieldProps<PhoneField<string>>) {
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
              Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder || ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter placeholder text"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Pattern (regex)
            </label>
            <input
              type="text"
              value={field.pattern || ""}
              onChange={(e) => onUpdate({ pattern: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., ^\\+?[1-9]\\d{1,14}$"
            />
          </div>

          <div>
            <RequiredToggle
              checked={field.required}
              onChange={(checked) => onUpdate({ required: checked })}
            />
          </div>
        </div>

        {/* Field Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {field.label}
            <RequiredAsterisk required={!!field.required} />
          </label>
          <input
            type="tel"
            placeholder={field.placeholder || "Enter phone number"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled
          />
        </div>

        <ConditionalVisibility
          field={field}
          previousFields={previousFields || []}
          onChange={onUpdate}
        />
      </div>
    </FieldWrapper>
  );
}
