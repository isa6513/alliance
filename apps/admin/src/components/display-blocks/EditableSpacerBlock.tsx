import type { SpacerBlock } from "@alliance/shared/lib/display-blocks";
import type { BaseDisplayBlockProps } from "./types";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";

export function EditableSpacerBlock({ block, onUpdate, onRemove, onDragStart, onDragEnd, isDragging }: BaseDisplayBlockProps<SpacerBlock<string>>) {
  return (
    <DisplayBlockWrapper onRemove={onRemove} onDragStart={onDragStart} onDragEnd={onDragEnd} isDragging={isDragging}>
      <div className="space-y-2">
        {/* The spacer itself */}
        <div className={`bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center ${
          block.size === "xs" ? "h-2" :
          block.size === "sm" ? "h-4" :
          block.size === "md" ? "h-8" :
          block.size === "lg" ? "h-16" :
          block.size === "xl" ? "h-24" :
          "h-8"
        }`}>
          <p className="text-xs text-gray-500">Spacer</p>
        </div>
        
        {/* Compact size selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Size:</span>
          <select
            value={block.size || "md"}
            onChange={(e) => onUpdate({ size: e.target.value as "xs" | "sm" | "md" | "lg" | "xl" })}
            className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="xs">XS</option>
            <option value="sm">SM</option>
            <option value="md">MD</option>
            <option value="lg">LG</option>
            <option value="xl">XL</option>
          </select>
        </div>
      </div>
    </DisplayBlockWrapper>
  );
}