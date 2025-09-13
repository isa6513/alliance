import type { AnyField, MultiSelectField, SelectField } from "@alliance/shared/forms/formschema";
import RenderField from "@alliance/shared/forms/RenderField";
import { ConditionalVisibility, RequiredToggle } from "./CommonControls";
import { FieldLabelEditor } from "./FieldLabelEditor";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps } from "./types";

type ChoiceField = SelectField | MultiSelectField;

type EditableChoiceFieldProps = BaseFieldProps<ChoiceField>;

export function EditableChoiceField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: EditableChoiceFieldProps) {
  const addOption = () => {
    const nextIndex = (field.options?.length || 0) + 1;
    const newOption = {
      label: `Option ${nextIndex}`,
      value: `option${nextIndex}`,
    };
    onUpdate({
      options: [...(field.options || []), newOption],
    });
  };

  const updateOption = (
    index: number,
    updates: { label?: string; value?: string }
  ) => {
    const updatedOptions = [...(field.options || [])];
    updatedOptions[index] = { ...updatedOptions[index], ...updates };
    onUpdate({ options: updatedOptions });
  };

  const removeOption = (index: number) => {
    const updatedOptions = field.options?.filter((_, i) => i !== index) || [];
    onUpdate({ options: updatedOptions });
  };

  const moveOption = (from: number, to: number) => {
    if (!field.options) return;
    if (to < 0 || to >= field.options.length) return;
    const updated = [...field.options];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onUpdate({ options: updated });
  };

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

          <ConditionalVisibility field={field} previousFields={(previousFields || []) as AnyField[]} onChange={onUpdate} />

          {/* Options Configuration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-700">
                Options
              </label>
              <button
                onClick={addOption}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Option
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) =>
                      updateOption(index, { label: e.target.value })
                    }
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Option label"
                  />
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) =>
                      updateOption(index, { value: e.target.value })
                    }
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Value"
                  />
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => moveOption(index, index - 1)}
                      disabled={index === 0}
                      className="px-1 py-0.5 text-xs rounded border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                      aria-label="Move option up"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveOption(index, index + 1)}
                      disabled={index === (field.options?.length || 0) - 1}
                      className="px-1 py-0.5 text-xs rounded border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                      aria-label="Move option down"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <RenderField field={field} disabled />
        </div>
      </div>
    </FieldWrapper>
  );
}
