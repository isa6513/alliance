import { formatTime } from "@alliance/shared/lib/utils";
import { NotificationDto } from "@alliance/shared/client";
import ProfileImage from "@alliance/sharedweb/ui/ProfileImage";

export interface NotificationTextProps {
  notification: NotificationDto;
  handleNotifClick: (notification: NotificationDto) => () => void;
  className?: string;
}

const NotificationText = ({
  notification,
  handleNotifClick,
  className,
}: NotificationTextProps) => {
  return (
    <div className={className} onClick={handleNotifClick(notification)}>
      <h3 className="line-clamp-2">
        {notification.associatedUsers.length > 0 && (
          <div className="inline mr-1 h-6">
            {notification.associatedUsers.map((user) => (
              <ProfileImage
                key={user.id}
                pfp={user.profilePicture}
                size="small"
                className="mr-1 align-middle"
              />
            ))}
          </div>
        )}
        {notification.category === "action_update" && (
          <span className="font-semibold">Action update: </span>
        )}
        {notification.category === "forum_reply" && (
          <span>New reply from </span>
        )}
        {notification.message}
      </h3>
      <p className=" text-zinc-500 text-sm">
        {formatTime(new Date(notification.sendTime || notification.createdAt), {
          addSuffix: true,
        })}
      </p>
    </div>
  );
};

export default NotificationText;
