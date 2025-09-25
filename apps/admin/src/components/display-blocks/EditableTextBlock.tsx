import type { TextBlock } from "@alliance/shared/forms/display-blocks";
import { ConditionalVisibility } from "../form-fields/CommonControls";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import type { BaseDisplayBlockProps } from "./types";

export function EditableTextBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseDisplayBlockProps<TextBlock>) {
  return (
    <DisplayBlockWrapper
      onRemove={onRemove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <textarea
            value={block.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full text-gray-900 border-none outline-none bg-transparent resize-none whitespace-pre-wrap"
            placeholder="Enter text content"
            rows={Math.max(2, block.text.split("\n").length)}
          />
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
