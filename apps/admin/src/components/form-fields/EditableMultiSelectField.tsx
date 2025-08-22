import type { MultiSelectField } from "@alliance/shared/lib/formschema";
import type { BaseFieldProps } from "./types";
import { FieldWrapper } from "./FieldWrapper";

export function EditableMultiSelectField({ field, onUpdate, onRemove, onDragStart, onDragEnd, isDragging }: BaseFieldProps<MultiSelectField<string, string>>) {
  const addOption = () => {
    const newOption = {
      label: `Option ${(field.options?.length || 0) + 1}`,
      value: `option${(field.options?.length || 0) + 1}`
    };
    onUpdate({
      options: [...(field.options || []), newOption]
    });
  };

  const updateOption = (index: number, updates: { label?: string; value?: string }) => {
    const updatedOptions = [...(field.options || [])];
    updatedOptions[index] = { ...updatedOptions[index], ...updates };
    onUpdate({ options: updatedOptions });
  };

  const removeOption = (index: number) => {
    const updatedOptions = field.options?.filter((_, i) => i !== index) || [];
    onUpdate({ options: updatedOptions });
  };

  return (
    <FieldWrapper onRemove={onRemove} onDragStart={onDragStart} onDragEnd={onDragEnd} isDragging={isDragging}>
      <div className="space-y-3">
        {/* Field Configuration */}
        <div className="bg-gray-50 p-3 rounded-md space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Field Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter field label"
            />
          </div>
          
          <div>
            <label className="flex items-center text-xs text-gray-700">
              <input
                type="checkbox"
                checked={field.required || false}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="mr-1"
              />
              Required
            </label>
          </div>

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
                    onChange={(e) => updateOption(index, { label: e.target.value })}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Option label"
                  />
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => updateOption(index, { value: e.target.value })}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Value"
                  />
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
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="border border-gray-300 rounded-md p-2 bg-gray-50 min-h-[100px]">
            <p className="text-xs text-gray-500 mb-2">Multiple selections allowed:</p>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled
                  />
                  <label className="text-sm text-gray-900">{option.label}</label>
                </div>
              ))}
              {(!field.options || field.options.length === 0) && (
                <p className="text-sm text-gray-500 italic">No options added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </FieldWrapper>
  );
}