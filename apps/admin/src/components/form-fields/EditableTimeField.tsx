import type { TimeField } from "@alliance/sharedweb/forms/formschema";
import { AutoExtractUserDataToggle, RequiredToggle } from "./CommonControls";
import { FieldLabelEditor } from "./FieldLabelEditor";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps } from "./types";

export function EditableTimeField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseFieldProps<TimeField>) {
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
      <p className="text-xs text-gray-500">
        Collects a time in 12-hour format (e.g. 7:30 PM).
      </p>
    </FieldWrapper>
  );
}
