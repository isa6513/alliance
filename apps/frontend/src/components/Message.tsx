import { MessageDto } from "@alliance/shared/client";
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
  return (
    <div
      className={`${className} flex flex-row gap-x-3 px-2 py-1 ${
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
        <span>{message.body}</span>
      </div>
    </div>
  );
};

export default Message;
