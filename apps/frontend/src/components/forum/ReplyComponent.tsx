import React from "react";
import { formatDistanceToNow } from "date-fns";
import Card from "../system/Card";
import { ReplyDto, UserDto } from "@alliance/shared/client";
import ReplyForm from "./ReplyForm";

interface ReplyComponentProps {
  reply: ReplyDto;
  depth?: number;
  user?: UserDto;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleSubmitReply: (e: React.FormEvent) => void;
  handleDeleteReply: (id: number) => void;
  isSubmitting: boolean;
}

const ReplyComponent = ({
  reply,
  depth = 0,
  user,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  handleDeleteReply,
  isSubmitting,
}: ReplyComponentProps) => {
  const maxDepth = 10;
  const isNested = depth > 0;
  const canNest = depth < maxDepth;
  const isReplyingToThis = replyingTo === reply.id;

  return (
    <div className={`${isNested && "ml-6 mt-3"}`}>
      <Card key={reply.id}>
        <div className="mb-1 whitespace-pre-wrap">{reply.content}</div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="gap-x-2 flex">
            {reply.author?.name !== undefined && (
              <p>Reply by {reply.author?.name}</p>
            )}
            <span>
              {formatDistanceToNow(new Date(reply.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="flex space-x-2">
            {user && canNest && (
              <button
                onClick={() => {
                  setReplyingTo(isReplyingToThis ? null : reply.id);
                  if (!isReplyingToThis) {
                    setReplyContent("");
                  }
                }}
                className="text-blue-600 hover:underline"
              >
                {!isReplyingToThis && "Reply"}
              </button>
            )}
            {user && reply.author.email === user.email && (
              <button
                onClick={() => handleDeleteReply(reply.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </Card>
      {user && isReplyingToThis && (
        <ReplyForm
          parentId={reply.id}
          onCancel={() => setReplyingTo(null)}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          onSubmit={handleSubmitReply}
          isSubmitting={isSubmitting}
          setReplyingTo={setReplyingTo}
        />
      )}

      {reply.children && reply.children.length > 0 && (
        <div className="mt-2">
          {reply.children.map((childReply) => (
            <ReplyComponent
              key={childReply.id}
              reply={childReply}
              depth={depth + 1}
              user={user}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleSubmitReply={handleSubmitReply}
              handleDeleteReply={handleDeleteReply}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplyComponent;
