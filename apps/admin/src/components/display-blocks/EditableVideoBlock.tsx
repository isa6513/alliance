import type { VideoBlock } from "@alliance/shared/forms/display-blocks";
import { useState, useEffect } from "react";
import RenderDisplayBlock from "@alliance/sharedweb/forms/RenderDisplayBlock";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import type { BaseDisplayBlockProps } from "./types";
import { getApiUrl } from "@alliance/sharedweb/lib/config";

export function EditableVideoBlock({
  block,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseDisplayBlockProps<VideoBlock>) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  // Check status immediately, then poll if still processing
  useEffect(() => {
    if (!block.videoId || processingStatus === "ready" || processingStatus === "failed") return;

    let cancelled = false;

    const checkStatus = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/videos/${block.videoId}/status`, {
          credentials: "include",
        });
        if (!res.ok || cancelled) return false;
        const data = await res.json();
        if (data.status === "ready" || data.status === "failed") {
          setProcessingStatus(data.status);
          return true;
        }
      } catch {
        // ignore polling errors
      }
      setProcessingStatus("processing");
      return false;
    };

    void checkStatus().then((done) => {
      if (done || cancelled) return;
      const interval = setInterval(async () => {
        const finished = await checkStatus();
        if (finished || cancelled) clearInterval(interval);
      }, 3000);
      cleanupInterval = interval;
    });

    let cleanupInterval: ReturnType<typeof setInterval> | undefined;
    return () => {
      cancelled = true;
      if (cleanupInterval) clearInterval(cleanupInterval);
    };
  }, [block.videoId, processingStatus]);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    update: (updates: Partial<VideoBlock>) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setProcessingStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${getApiUrl()}/videos/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      update({ src: data.key, videoId: data.id });
      setProcessingStatus("processing");
    } catch (error) {
      console.error("Failed to upload video:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload video"
      );
    } finally {
      setIsUploading(false);
    }
  };

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
          <label className="block text-sm font-medium text-black">
            Video
          </label>
          {/* File upload */}
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="video/*"
              onChange={(event) => handleFileChange(event, handleUpdate)}
              disabled={isUploading}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            {isUploading && (
              <span className="text-xs text-blue-600">Uploading...</span>
            )}
          </div>

          {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

          {processingStatus === "processing" && (
            <p className="text-xs text-blue-600">Processing video...</p>
          )}
          {processingStatus === "failed" && (
            <p className="text-xs text-red-600">Video processing failed. Try again.</p>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">
              Caption
            </label>
            <input
              type="text"
              value={activeBlock.caption ?? ""}
              onChange={(e) => handleUpdate({ caption: e.target.value })}
              placeholder="Add an optional caption"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Preview */}
          {activeBlock.src && (
            <div className="pt-2 border-t border-gray-200">
              <RenderDisplayBlock block={activeBlock} />
            </div>
          )}
        </div>
      )}
    </DisplayBlockWrapper>
  );
}
