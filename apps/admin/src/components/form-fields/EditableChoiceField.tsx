import type {
  AnyField,
  MultiSelectField,
  SelectField,
} from "@alliance/shared/forms/formschema";
import {
  ConditionalVisibility,
  RequiredAsterisk,
  RequiredToggle,
} from "./CommonControls";
import { FieldWrapper } from "./FieldWrapper";
import { FieldLabelEditor } from "./FieldLabelEditor";
import type { BaseFieldProps } from "./types";

type ChoiceField<TId extends string> =
  | SelectField<TId, string>
  | MultiSelectField<TId, string>;

type EditableChoiceFieldProps<TId extends string> = BaseFieldProps<
  ChoiceField<TId>
> & {
  multiple?: boolean;
};

export function EditableChoiceField<TId extends string = string>({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
  multiple,
}: EditableChoiceFieldProps<TId>) {
  const isMulti = multiple ?? field.kind === "multiselect";

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
            previousFields={(previousFields || []) as AnyField<TId>[]}
            onChange={onUpdate}
          />

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

        {/* Field Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {field.label}
            <RequiredAsterisk required={!!field.required} />
          </label>
          {isMulti ? (
            <div className="border border-gray-300 rounded-md p-2 bg-gray-50 min-h-[100px]">
              <p className="text-xs text-gray-500 mb-2">
                Multiple selections allowed:
              </p>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled
                    />
                    <label className="text-sm text-gray-900">
                      {option.label}
                    </label>
                  </div>
                ))}
                {(!field.options || field.options.length === 0) && (
                  <p className="text-sm text-gray-500 italic">
                    No options added yet
                  </p>
                )}
              </div>
            </div>
          ) : (
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled
            >
              <option value="">Select an option...</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          {(!field.options || field.options.length === 0) && !isMulti && (
            <p className="text-xs text-gray-500 mt-1 italic">
              No options added yet
            </p>
          )}
        </div>
      </div>
    </FieldWrapper>
  );
}
