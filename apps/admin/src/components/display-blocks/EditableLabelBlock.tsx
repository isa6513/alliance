import type { LabelBlock } from "@alliance/shared/forms/display-blocks";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import type { BaseDisplayBlockProps } from "./types";

export function EditableLabelBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
}: BaseDisplayBlockProps<LabelBlock<string>>) {
  return (
    <DisplayBlockWrapper
      onRemove={onRemove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
    >
      <input
        type="text"
        value={block.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        className="text-sm font-medium text-gray-700 border-none outline-none bg-transparent w-full"
        placeholder="Enter label text"
      />
    </DisplayBlockWrapper>
  );
}
