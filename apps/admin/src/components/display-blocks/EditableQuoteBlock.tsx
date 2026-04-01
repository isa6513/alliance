import type { QuoteBlock } from "@alliance/common/forms/display-blocks";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import type { BaseDisplayBlockProps } from "./types";
import FormTextarea from "../FormTextarea";

export function EditableQuoteBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseDisplayBlockProps<QuoteBlock>) {
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
        <div className="space-y-2 bg-zinc-100 px-5 py-4">
          <FormTextarea
            value={activeBlock.text}
            onChange={(e) => handleUpdate({ text: e.target.value })}
            className="w-full text-gray-900 border-none outline-none !bg-transparent resize-none whitespace-pre-wrap"
            placeholder="Enter text content"
            rows={Math.max(2, activeBlock.text.split("\n").length)}
            style={{ resize: "vertical" }}
          />
        </div>
      )}
    </DisplayBlockWrapper>
  );
}
