import type { EmailField } from "@alliance/shared/forms/formschema";
import { FieldWrapper } from "./FieldWrapper";
import { FieldLabelEditor } from "./FieldLabelEditor";
import { RequiredAsterisk, RequiredToggle, ConditionalVisibility } from "./CommonControls";
import type { BaseFieldProps } from "./types";

export function EditableEmailField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseFieldProps<EmailField<string>>) {
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
          <FieldLabelEditor
            value={field.label}
            onChange={(v) => onUpdate({ label: v })}
          />

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
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {field.label}
            <RequiredAsterisk required={!!field.required} />
          </label>
          <input
            type="email"
            placeholder="Enter email address..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled
          />
        </div>
      </div>
    </FieldWrapper>
  );
}
