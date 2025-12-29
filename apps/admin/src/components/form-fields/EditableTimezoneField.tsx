import type { TimezoneField } from "@alliance/sharedweb/forms/formschema";
import { AutoExtractUserDataToggle, RequiredToggle } from "./CommonControls";
import { FieldLabelEditor } from "./FieldLabelEditor";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps } from "./types";

export function EditableTimezoneField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseFieldProps<TimezoneField>) {
  return (
    <FieldWrapper
      field={field}
      onUpdate={onUpdate}
      previousFields={previousFields}
      onRemove={onRemove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
    >
      <FieldLabelEditor
        value={field.label}
        onChange={(v) => onUpdate({ label: v })}
      />

      <RequiredToggle
        checked={field.required}
        onChange={(checked) => onUpdate({ required: checked })}
      />

      <AutoExtractUserDataToggle
        checked={!!field.autoExtractUserData}
        onChange={(checked) => onUpdate({ autoExtractUserData: checked })}
      />
    </FieldWrapper>
  );
}
