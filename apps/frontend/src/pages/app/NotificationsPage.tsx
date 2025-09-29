import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { useNotifications } from "../../lib/useNotifications";
import { formatTime } from "../../lib/utils";
import List from "@alliance/shared/ui/List";

const NotificationsPage = () => {
  const { allNotifications, handleNotifClick } = useNotifications();

  return (
    <div className="flex flex-col bg-page items-center">
      <div className="px-4 py-16 md:py-20 flex flex-col items-center w-[calc(min(650px,100%))] gap-y-6">
        <h2 className="w-full !font-semibold font-serif !text-3xl md:!text-4xl">
          All Notifications
        </h2>
        <List className="w-full">
          {allNotifications.map((notification) => (
            <div
              key={notification.id}
              className="hover:bg-zinc-100 p-4 flex cursor-pointer flex-col gap-y-2"
              onClick={handleNotifClick(
                notification.id,
                notification.webAppLocation
              )}
            >
              <div className="flex flex-row items-center gap-x-2">
                {notification.associatedUser && (
                  <ProfileImage
                    pfp={notification.associatedUser.profilePicture}
                    size="small"
                  />
                )}
                <h3>{notification.message}</h3>
              </div>
              <p className=" text-zinc-500 text-sm">
                {formatTime(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          ))}
        </List>
      </div>
    </div>
  );
};

export default NotificationsPage;
