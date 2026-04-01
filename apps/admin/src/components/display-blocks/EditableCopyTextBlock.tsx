import type { CopyTextBlock } from "@alliance/common/forms/display-blocks";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import type { BaseDisplayBlockProps } from "./types";

export function EditableCopyTextBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseDisplayBlockProps<CopyTextBlock>) {
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
      {({ block: activeBlock, onUpdate: handleUpdate }) => (
        <div className="space-y-2">
          <input
            type="text"
            value={activeBlock.title ?? ""}
            onChange={(e) =>
              handleUpdate({ title: e.target.value || undefined })
            }
            className="w-full text-xs text-gray-500 border-none outline-none bg-transparent"
            placeholder="Title (optional)"
          />
          <input
            type="text"
            value={activeBlock.text}
            onChange={(e) => handleUpdate({ text: e.target.value })}
            className="w-full text-sm text-gray-900 border-none outline-none bg-transparent"
            placeholder="Text to copy (e.g. email, URL)"
          />
        </div>
      )}
    </DisplayBlockWrapper>
  );
}
