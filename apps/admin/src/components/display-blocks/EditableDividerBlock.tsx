import type { DividerBlock } from "@alliance/shared/forms/display-blocks";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import RenderDisplayBlock from "@alliance/shared/forms/RenderDisplayBlock";
import type { BaseDisplayBlockProps } from "./types";

export function EditableDividerBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
}: BaseDisplayBlockProps<DividerBlock>) {
  return (
    <DisplayBlockWrapper
      onRemove={onRemove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
    >
      <div className="space-y-2">
        {/* Compact thickness selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Thickness:</span>
          <select
            value={block.thickness || "thin"}
            onChange={(e) =>
              onUpdate({
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
          <RenderDisplayBlock block={block} />
        </div>
      </div>
    </DisplayBlockWrapper>
  );
}
