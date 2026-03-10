import { formatTime } from "@alliance/shared/lib/utils";
import { NotificationDto } from "@alliance/shared/client";
import { AvatarProfile, AvatarGroup } from "@alliance/sharedweb/ui/Avatar";

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
          <AvatarGroup className="inline-flex mr-1 h-6 align-middle">
            {notification.associatedUsers.map((user) => (
              <AvatarProfile
                key={user.id}
                pfp={user.profilePicture}
                size="small"
              />
            ))}
          </AvatarGroup>
        )}
        {notification.category === "action_update" && (
          <span className="font-semibold">Action update: </span>
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
