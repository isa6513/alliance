import type { ImageBlock } from "@alliance/shared/lib/display-blocks";
import type { BaseDisplayBlockProps } from "./types";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";

export function EditableImageBlock({ block, onUpdate, onRemove, onDragStart, onDragEnd, isDragging }: BaseDisplayBlockProps<ImageBlock<string>>) {
  return (
    <DisplayBlockWrapper onRemove={onRemove} onDragStart={onDragStart} onDragEnd={onDragEnd} isDragging={isDragging}>
      <div className="space-y-2">
        {/* Image preview/placeholder */}
        {block.src ? (
          <img 
            src={block.src} 
            alt={block.alt}
            className="max-w-full h-auto rounded border"
            style={{ 
              maxHeight: "200px",
              aspectRatio: block.aspectRatio ? block.aspectRatio.toString() : undefined
            }}
          />
        ) : (
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded p-8 text-center">
            <p className="text-gray-500 text-sm">Enter image URL below</p>
          </div>
        )}
        
        {/* Compact inline controls */}
        <div className="space-y-1">
          <input
            type="url"
            value={block.src}
            onChange={(e) => onUpdate({ src: e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Image URL"
          />
          <input
            type="text"
            value={block.alt}
            onChange={(e) => onUpdate({ alt: e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Alt text for accessibility"
          />
        </div>
      </div>
    </DisplayBlockWrapper>
  );
}