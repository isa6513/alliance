import { MessageDto } from "@alliance/shared/client";
import ProfileImage from "@alliance/shared/ui/ProfileImage";

const Message = ({
  message,
  className,
}: {
  message: MessageDto;
  className?: string;
}) => {
  return (
    <div className={`${className} flex flex-row justify-between`}>
      <div className="flex flex-row items-center gap-x-2">
        <ProfileImage pfp={message.author.profilePicture} size="medium" />
        <span>{message.body}</span>
      </div>
    </div>
  );
};

export default Message;
