import type { TextBlock } from "@alliance/shared/forms/display-blocks";
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
      block={block}
      onUpdate={onUpdate}
      previousFields={previousFields}
    >
      <div className="space-y-2">
        <textarea
          value={block.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full text-gray-900 border-none outline-none bg-transparent resize-none whitespace-pre-wrap"
          placeholder="Enter text content"
          rows={Math.max(2, block.text.split("\n").length)}
        />

        <div className="flex items-center gap-2">
          <label className="flex items-center text-xs text-gray-500">
            <input
              type="checkbox"
              checked={block.markdown || false}
              onChange={(e) => onUpdate({ markdown: e.target.checked })}
              className="mr-1"
            />
            Markdown formatting
          </label>
        </div>
      </div>
    </DisplayBlockWrapper>
  );
}
