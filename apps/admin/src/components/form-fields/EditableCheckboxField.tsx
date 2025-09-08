import type { CheckboxField } from "@alliance/shared/forms/formschema";
import RenderField from "@alliance/shared/forms/RenderField";
import { ConditionalVisibility, RequiredToggle } from "./CommonControls";
import { FieldLabelEditor } from "./FieldLabelEditor";
import { FieldWrapper } from "./FieldWrapper";
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
        <div className="bg-gray-100 p-3 rounded-md space-y-2">
          <FieldLabelEditor
            label="Checkbox Label"
            value={field.label}
            onChange={(v) => onUpdate({ label: v })}
            placeholder="Enter checkbox label"
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
          <RenderField field={field} disabled />
        </div>
      </div>
    </FieldWrapper>
  );
}
