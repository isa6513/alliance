import type { LabelBlock } from "@alliance/shared/forms/display-blocks";
import { ConditionalVisibility } from "../form-fields/CommonControls";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import type { BaseDisplayBlockProps } from "./types";

export function EditableLabelBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseDisplayBlockProps<LabelBlock>) {
  return (
    <DisplayBlockWrapper
      onRemove={onRemove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
    >
      <div className="space-y-3">
        <input
          type="text"
          value={block.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="text-sm font-medium text-gray-700 border-none outline-none bg-transparent w-full"
          placeholder="Enter label text"
        />

        <ConditionalVisibility
          field={block}
          previousFields={previousFields || []}
          onChange={onUpdate}
        />
      </div>
    </DisplayBlockWrapper>
  );
}
