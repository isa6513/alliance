import type { MessageDto } from "@alliance/shared/client";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { Link, href } from "react-router";

const Message = ({
  message,
  className,
  isFirstInGroup,
}: {
  message: MessageDto;
  className?: string;
  isFirstInGroup?: boolean;
}) => {
  const attachments =
    (message as MessageDto & { attachments?: string[] }).attachments ?? [];

  return (
    <div
      className={`${className} bg-white hover:bg-zinc-100 rounded-md flex flex-row gap-x-3 px-2 py-1 ${
        isFirstInGroup ? "pt-2" : "pt-1"
      }`}
    >
      <div className="w-8 shrink-0 mt-1">
        {isFirstInGroup && (
          <Link to={href("/user/:id", { id: message.author.id.toString() })}>
            <ProfileImage pfp={message.author.profilePicture} size="medium" />
          </Link>
        )}
      </div>
      <div className="flex flex-col -mt-1">
        {isFirstInGroup && (
          <span className="font-semibold">{message.author.displayName}</span>
        )}
        {message.body && <span>{message.body}</span>}
        {attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((attachment, idx) => (
              <img
                key={`${message.id}-attachment-${idx}`}
                src={attachment}
                className="w-28 h-28 object-cover rounded border border-zinc-200"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
