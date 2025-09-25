import type { HeaderBlock } from "@alliance/shared/forms/display-blocks";
import { ConditionalVisibility } from "../form-fields/CommonControls";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import type { BaseDisplayBlockProps } from "./types";

export function EditableHeaderBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseDisplayBlockProps<HeaderBlock>) {
  return (
    <DisplayBlockWrapper
      onRemove={onRemove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
    >
      <div className="space-y-3">
        <div className="space-y-2">
          {/* Inline editable header */}
          <input
            type="text"
            value={block.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className={`w-full font-bold text-gray-900 border-none outline-none bg-transparent resize-none ${
              (block.level || 2) === 1
                ? "text-3xl"
                : (block.level || 2) === 2
                ? "text-2xl"
                : (block.level || 2) === 3
                ? "text-xl"
                : (block.level || 2) === 4
                ? "text-lg"
                : (block.level || 2) === 5
                ? "text-base"
                : "text-sm"
            }`}
            placeholder="Enter header text"
          />

          {/* Compact level selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Level:</span>
            <select
              value={block.level || 2}
              onChange={(e) =>
                onUpdate({
                  level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6,
                })
              }
              className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
              <option value={5}>H5</option>
              <option value={6}>H6</option>
            </select>
          </div>
        </div>

        <ConditionalVisibility
          field={block}
          previousFields={previousFields || []}
          onChange={onUpdate}
        />
      </div>
    </DisplayBlockWrapper>
  );
}
