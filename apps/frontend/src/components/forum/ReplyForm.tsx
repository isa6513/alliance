import React from "react";

interface ReplyFormProps {
  parentId?: number | null;
  onCancel?: () => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  setReplyingTo: (id: number | null) => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  parentId,
  onCancel,
  replyContent,
  setReplyContent,
  onSubmit,
  isSubmitting,
  setReplyingTo,
}: ReplyFormProps) => (
  <div className="bg-gray-50 p-4 rounded-lg mt-3">
    <form onSubmit={onSubmit}>
      <textarea
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-transparent border-none"
        rows={3}
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder={
          parentId ? "Write your reply to this comment..." : "Add a comment..."
        }
        required
        autoFocus
      />
      <div className="mt-3 flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => {
            setReplyingTo(null);
            setReplyContent("");
            onCancel?.();
          }}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !replyContent.trim()}
          className="px-4 py-2 bg-blue text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSubmitting ? "Posting..." : "Post Reply"}
        </button>
      </div>
    </form>
  </div>
);

export default ReplyForm;
