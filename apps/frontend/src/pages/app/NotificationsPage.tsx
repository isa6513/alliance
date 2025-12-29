import ProfileImage from "@alliance/sharedweb/ui/ProfileImage";
import { useNotifications } from "../../lib/useNotifications";
import { formatTime } from "@alliance/sharedweb/lib/utils";
import List from "@alliance/sharedweb/ui/List";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";

const NotificationsPage = () => {
  const { notifications, handleMarkAllAsRead, handleNotifClick } =
    useNotifications();

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt
  ).length;

  return (
    <CenterLayout>
      <div className="md:mt-8 flex flex-col items-center w-[calc(min(650px,100%))] gap-y-6">
        <div className="w-full flex flex-row justify-between items-end">
          <h2 className="!font-semibold font-serif !text-3xl md:!text-4xl">
            Notifications
          </h2>

          {unreadCount > 0 && (
            <Button color={ButtonColor.White} onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <List className="w-full">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`hover:bg-zinc-100 p-4 flex cursor-pointer flex-col gap-y-2 ${
                notification.readAt ? "bg-white" : "bg-red-50"
              }`}
              onClick={handleNotifClick(
                notification.id,
                notification.webAppLocation
              )}
            >
              <h3 className="line-clamp-2">
                {notification.associatedUsers.length > 0 && (
                  <div className="inline mr-1">
                    {notification.associatedUsers.map((user) => (
                      <ProfileImage
                        key={user.id}
                        pfp={user.profilePicture}
                        size="small"
                        className="mr-1"
                      />
                    ))}
                  </div>
                )}
                {notification.category === "action_update" && (
                  <span className="font-semibold">Action update: </span>
                )}
                {notification.message}
              </h3>
              <p className=" text-zinc-500 text-sm">
                {formatTime(
                  new Date(notification.sendTime || notification.createdAt),
                  {
                    addSuffix: true,
                  }
                )}
              </p>
            </div>
          ))}
        </List>
      </div>
    </CenterLayout>
  );
};

export default NotificationsPage;
