import type { SpacerBlock } from "@alliance/sharedweb/forms/display-blocks";
import RenderDisplayBlock from "@alliance/sharedweb/forms/RenderDisplayBlock";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import type { BaseDisplayBlockProps } from "./types";

export function EditableSpacerBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseDisplayBlockProps<SpacerBlock>) {
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
          {/* Compact size selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Size:</span>
            <select
              value={activeBlock.size || "md"}
              onChange={(e) =>
                handleUpdate({
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
            <RenderDisplayBlock block={activeBlock} />
          </div>
        </div>
      )}
    </DisplayBlockWrapper>
  );
}
