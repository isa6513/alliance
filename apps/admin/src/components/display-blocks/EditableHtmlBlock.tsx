import type { HtmlBlock } from "@alliance/shared/forms/display-blocks";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import RenderDisplayBlock from "@alliance/shared/forms/RenderDisplayBlock";
import type { BaseDisplayBlockProps } from "./types";

export function EditableHtmlBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
}: BaseDisplayBlockProps<HtmlBlock>) {
  return (
    <DisplayBlockWrapper
      onRemove={onRemove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
    >
      <div className="space-y-2">
        {/* Inline HTML editor */}
        <textarea
          value={block.html}
          onChange={(e) => onUpdate({ html: e.target.value })}
          className="w-full px-2 py-1 text-sm border border-yellow-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 font-mono bg-yellow-50"
          placeholder="Enter HTML content"
          rows={Math.max(2, block.html.split("\n").length)}
        />
        {/* Preview */}
        <div className="pt-2 border-t border-gray-200">
          <RenderDisplayBlock block={block} />
        </div>
      </div>
    </DisplayBlockWrapper>
  );
}
