import type { DisplayBlock } from "@alliance/shared/forms/display-blocks";
import type { AnyField, Condition } from "@alliance/shared/forms/formschema";
import { ConditionalVisibility } from "../form-fields/CommonControls";

interface DisplayBlockWrapperProps<T extends DisplayBlock = DisplayBlock> {
  children: React.ReactNode;
  onRemove: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  block?: T;
  onUpdate?: (updates: Partial<T>) => void;
  previousFields?: AnyField[];
}

export function DisplayBlockWrapper<T extends DisplayBlock = DisplayBlock>({
  children,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  block,
  onUpdate,
  previousFields,
}: DisplayBlockWrapperProps<T>) {
  const showConditional = Boolean(block && onUpdate);

  const handleConditionalChange = (updates: { visibleIf?: Condition }) => {
    if (onUpdate) {
      onUpdate(updates);
    }
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
        <div
          className="text-gray-400 hover:text-gray-600 p-1"
          style={{ userSelect: "none" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            style={{ userSelect: "none" }}
          >
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
      <div className={showConditional ? "space-y-3" : undefined}>
        {children}
        {showConditional && (
          <ConditionalVisibility
            field={block as DisplayBlock}
            previousFields={previousFields || []}
            onChange={handleConditionalChange}
          />
        )}
      </div>
    </div>
  );
}
