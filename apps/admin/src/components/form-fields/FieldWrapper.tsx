import type { AnyField } from "@alliance/shared/forms/formschema";
import { ConditionalVisibility, CustomValidatorSelect } from "./CommonControls";
import type { FieldWrapperProps } from "./types";
import RenderField from "@alliance/shared/forms/RenderField";

function isFormField(field: unknown): field is AnyField {
  return Boolean(
    field && typeof field === "object" && "kind" in (field as AnyField)
  );
}

export function FieldWrapper<T extends AnyField>({
  field,
  onUpdate,
  previousFields,
  onRemove,
  children,
  onDragStart,
  onDragEnd,
  isDragging,
}: FieldWrapperProps<T>) {
  const handleValidatorChange = (validatorId: number | undefined) => {
    onUpdate({ customValidatorId: validatorId } as Partial<T>);
  };

  const handleVisibilityChange = (updates: {
    visibleIf?: AnyField["visibleIf"];
  }) => {
    onUpdate(updates as unknown as Partial<T>);
  };

  return (
    <div
      className={`group relative border rounded-lg p-4 pl-8 transition-all ${
        isDragging
          ? "border-blue-400 shadow-lg opacity-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Drag handle */}
      <div
        className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        title="Drag to reorder"
      >
        <div className="text-gray-400 hover:text-gray-600 p-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="2" cy="2" r="1" />
            <circle cx="6" cy="2" r="1" />
            <circle cx="2" cy="6" r="1" />
            <circle cx="6" cy="6" r="1" />
            <circle cx="2" cy="10" r="1" />
            <circle cx="6" cy="10" r="1" />
          </svg>
        </div>
      </div>

      {/* Remove button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50"
          title="Remove field"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-100 p-3 rounded-md space-y-2">{children}</div>
        {isFormField(field) && (
          <div>
            <RenderField field={field} disabled />
          </div>
        )}
        {isFormField(field) && (
          <div className="space-y-2 border-t pt-2 border-gray-200">
            <CustomValidatorSelect
              value={field.customValidatorId}
              onChange={handleValidatorChange}
            />
            <ConditionalVisibility
              field={field}
              previousFields={previousFields || []}
              onChange={handleVisibilityChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
