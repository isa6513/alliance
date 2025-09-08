import type { PhoneField } from "@alliance/shared/forms/formschema";
import RenderField from "@alliance/shared/forms/RenderField";
import { ConditionalVisibility, RequiredToggle } from "./CommonControls";
import { FieldLabelEditor } from "./FieldLabelEditor";
import { FieldWrapper } from "./FieldWrapper";
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
        <div className="bg-gray-100 p-3 rounded-md space-y-2">
          <FieldLabelEditor
            value={field.label}
            onChange={(v) => onUpdate({ label: v })}
          />

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
          <RenderField field={field} disabled />
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
