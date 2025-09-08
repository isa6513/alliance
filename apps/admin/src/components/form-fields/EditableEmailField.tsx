import type { EmailField } from "@alliance/shared/forms/formschema";
import RenderField from "@alliance/shared/forms/RenderField";
import { ConditionalVisibility, RequiredToggle } from "./CommonControls";
import { FieldLabelEditor } from "./FieldLabelEditor";
import { FieldWrapper } from "./FieldWrapper";
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
        <div className="bg-gray-100 p-3 rounded-md space-y-2">
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
          <RenderField field={field} disabled />
        </div>
      </div>
    </FieldWrapper>
  );
}
