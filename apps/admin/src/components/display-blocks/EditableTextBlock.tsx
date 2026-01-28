import { useState } from "react";
import type { TextBlock } from "@alliance/shared/forms/display-blocks";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import type { BaseDisplayBlockProps } from "./types";
import RenderDisplayBlock from "@alliance/sharedweb/forms/RenderDisplayBlock";
import FormTextarea from "../FormTextarea";

export function EditableTextBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseDisplayBlockProps<TextBlock>) {
  const [showPreview, setShowPreview] = useState(false);

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
          <FormTextarea
            value={activeBlock.text}
            onChange={(e) => handleUpdate({ text: e.target.value })}
            className="w-full text-gray-900 border-none outline-none bg-transparent resize-none whitespace-pre-wrap"
            placeholder="Enter text content"
            style={{ resize: "vertical" }}
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className="text-xs font-medium text-green hover:text-emerald-700"
            >
              {showPreview ? "Hide preview" : "Show preview"}
            </button>
          </div>

          {showPreview && (
            <div className="border border-gray-200 rounded-md p-3 bg-white">
              <RenderDisplayBlock
                block={{
                  ...activeBlock,
                  kind: "text",
                }}
              />
            </div>
          )}
        </div>
      )}
    </DisplayBlockWrapper>
  );
}
