import type { SpacerBlock } from "@alliance/shared/forms/display-blocks";
import RenderDisplayBlock from "@alliance/shared/forms/RenderDisplayBlock";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import type { BaseDisplayBlockProps } from "./types";

export function EditableSpacerBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
}: BaseDisplayBlockProps<SpacerBlock>) {
  return (
    <DisplayBlockWrapper
      onRemove={onRemove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
    >
      <div className="space-y-2">
        {/* Compact size selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Size:</span>
          <select
            value={block.size || "md"}
            onChange={(e) =>
              onUpdate({
                size: e.target.value as "xs" | "sm" | "md" | "lg" | "xl",
              })
            }
            className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="xs">XS</option>
            <option value="sm">SM</option>
            <option value="md">MD</option>
            <option value="lg">LG</option>
            <option value="xl">XL</option>
          </select>
        </div>
        <div className="pt-2 border-t border-gray-200">
          <RenderDisplayBlock block={block} />
        </div>
      </div>
    </DisplayBlockWrapper>
  );
}
