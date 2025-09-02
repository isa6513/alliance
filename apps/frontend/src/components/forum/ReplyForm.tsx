import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import React, { useState } from "react";

interface ReplyFormProps {
  parentId: number | null;
  onCancel?: () => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  setReplyingTo: (id: number | null) => void;
  compact?: boolean;
  className?: string;
  attachments: string[];
  setAttachments: (images: string[]) => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  parentId,
  onCancel,
  replyContent,
  setReplyContent,
  onSubmit,
  isSubmitting,
  setReplyingTo,
  compact,
  className,
  attachments,
  setAttachments,
}: ReplyFormProps) => {
  const [expanded, setExpanded] = useState(!compact);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleFilesSelected = async (e: {
    target?: { files: FileList | null };
    dataTransfer?: DataTransfer | null;
  }) => {
    const files = e.target?.files ?? e.dataTransfer?.files ?? null;
    if (!files || files.length === 0) return;

    const readers: Promise<string>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      readers.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );
    }

    try {
      const base64s = await Promise.all(readers);
      setAttachments([...(attachments ?? []), ...base64s]);
    } catch (err) {
      console.error("Failed reading image file(s)", err);
    }
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((c) => c + 1);
    setIsDragging(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((c) => {
      const next = c - 1;
      if (next <= 0) setIsDragging(false);
      return next;
    });
  };
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);
    await handleFilesSelected({ dataTransfer: e.dataTransfer });
  };
  return (
    <div
      className={` rounded-lg relative ${className} ${
        parentId ? "mt-0" : "mt-3"
      } ${compact ? "p-2 bg-zinc-100/80" : "p-4 bg-zinc-100"}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <form onSubmit={onSubmit}>
        <textarea
          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-transparent border-none ${
            expanded ? "" : "resize-none"
          }`}
          rows={expanded ? 3 : 1}
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder={
            parentId
              ? "Write your reply to this comment..."
              : "Add a comment..."
          }
          autoFocus={parentId !== null}
          onFocus={() => {
            setExpanded(true);
          }}
          onBlur={() => {
            if (compact && replyContent.length === 0) {
              setExpanded(false);
            }
          }}
        />
        {/* Drag overlay */}
        {expanded && isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 rounded-lg pointer-events-none">
            <div className="text-white font-medium">Drop images to attach</div>
          </div>
        )}
        {/* Image attachments preview */}
        {expanded && attachments && attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((img, idx) => (
              <div key={idx} className="relative inline-block">
                <img src={img} className="w-20 h-20 object-cover rounded" />
                <button
                  type="button"
                  onClick={() =>
                    setAttachments(attachments.filter((_, i) => i !== idx))
                  }
                  className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center pl-[0.5px] pb-[1px]"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {expanded && (
          <div className="mt-3 flex justify-end space-x-2 items-center">
            <p className="text-sm text-zinc-500 pr-2">
              Drag an image to attach
            </p>
            {parentId && (
              <Button
                type="button"
                color={ButtonColor.Grey}
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                  setAttachments([]);
                  onCancel?.();
                }}
                className="bg-gray-300"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              color={ButtonColor.Black}
              disabled={
                isSubmitting ||
                (!replyContent.trim() && attachments.length === 0)
              }
              className="transition disabled:opacity-50"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReplyForm;
