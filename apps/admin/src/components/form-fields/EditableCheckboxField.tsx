import type { CheckboxField } from "@alliance/shared/forms/formschema";
import { FieldWrapper } from "./FieldWrapper";
import { RequiredAsterisk, RequiredToggle, ConditionalVisibility } from "./CommonControls";
import type { BaseFieldProps } from "./types";

export function EditableCheckboxField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseFieldProps<CheckboxField<string>>) {
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
              Checkbox Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter checkbox label"
            />
          </div>

          <div>
            <RequiredToggle
              checked={field.required}
              onChange={(checked) => onUpdate({ required: checked })}
            />
          </div>

          <ConditionalVisibility
            field={field}
            previousFields={previousFields || []}
            onChange={onUpdate}
          />
        </div>

        {/* Field Preview */}
        <div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled
            />
            <label className="text-sm font-medium text-gray-900">
              {field.label}
              <RequiredAsterisk required={!!field.required} />
            </label>
          </div>
        </div>
      </div>
    </FieldWrapper>
  );
}
