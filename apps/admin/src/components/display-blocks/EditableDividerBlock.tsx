import type { DividerBlock } from "@alliance/common/forms/display-blocks";
import RenderDisplayBlock from "@alliance/sharedweb/forms/RenderDisplayBlock";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import type { BaseDisplayBlockProps } from "./types";

export function EditableDividerBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseDisplayBlockProps<DividerBlock>) {
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
          {/* Compact thickness selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Thickness:</span>
            <select
              value={activeBlock.thickness || "thin"}
              onChange={(e) =>
                handleUpdate({
                  thickness: e.target.value as
                    | "hairline"
                    | "thin"
                    | "medium"
                    | "thick",
                })
              }
              className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="hairline">Hairline</option>
              <option value="thin">Thin</option>
              <option value="medium">Medium</option>
              <option value="thick">Thick</option>
            </select>
          </div>

          {/* Preview */}
          <div className="pt-2 border-t border-gray-200">
            <RenderDisplayBlock block={activeBlock} />
          </div>
        </div>
      )}
    </DisplayBlockWrapper>
  );
}
