import React, { useState } from "react";
import Button, { ButtonColor } from "../system/Button";

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
}: ReplyFormProps) => {
  const [expanded, setExpanded] = useState(!compact);
  return (
    <div
      className={` rounded-lg ${className} ${parentId ? "mt-0" : "mt-3"} ${
        compact ? "p-2 bg-zinc-100/80" : "p-4 bg-zinc-100"
      }`}
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
          required
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
        {expanded && (
          <div className="mt-3 flex justify-end space-x-2">
            {parentId && (
              <Button
                type="button"
                color={ButtonColor.Grey}
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
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
              disabled={isSubmitting || !replyContent.trim()}
              className="transition disabled:opacity-50"
            >
              {isSubmitting ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReplyForm;
