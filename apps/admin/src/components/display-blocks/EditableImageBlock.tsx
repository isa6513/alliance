import { imagesUploadImage } from "@alliance/shared/client";
import type { ImageBlock } from "@alliance/shared/forms/display-blocks";
import { useState } from "react";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import RenderDisplayBlock from "@alliance/shared/forms/RenderDisplayBlock";
import type { BaseDisplayBlockProps } from "./types";

export function EditableImageBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
}: BaseDisplayBlockProps<ImageBlock>) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === "string") {
          try {
            const { data } = await imagesUploadImage({
              body: { file: reader.result },
            });
            if (data) {
              onUpdate({ src: data });
            }
          } catch (error) {
            console.error("Failed to upload image:", error);
            setUploadError("Failed to upload image");
          }
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to read file:", error);
      setUploadError("Failed to read file");
      setIsUploading(false);
    }
  };

  return (
    <DisplayBlockWrapper
      onRemove={onRemove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
    >
      <div className="space-y-2">
        {/* Compact inline controls */}
        <div className="space-y-2">
          {/* File upload */}
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            {isUploading && (
              <span className="text-xs text-blue-600">Uploading...</span>
            )}
          </div>

          {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        </div>

        {/* Preview */}
        <div className="pt-2 border-t border-gray-200">
          <RenderDisplayBlock block={block} />
        </div>
      </div>
    </DisplayBlockWrapper>
  );
}
