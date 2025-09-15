import Card from "@alliance/shared/ui/Card";
import ProfileImage from "../../components/ProfileImage";
import { useNotifications } from "../../lib/useNotifications";
import { formatTime } from "../../lib/utils";

const NotificationsPage = () => {
  const { allNotifications, handleNotifClick } = useNotifications();

  return (
    <div className="flex flex-col bg-page items-center">
      <div className="px-4 py-16 md:py-20 flex flex-col items-center w-[calc(min(650px,100%))] gap-y-6">
        <h2 className="w-full !font-semibold font-serif !text-3xl md:!text-4xl">
          All Notifications
        </h2>
        <div className="flex flex-col gap-y-2 w-full">
          {allNotifications.map((notification) => (
            <Card
              key={notification.id}
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
              <p className=" text-zinc-500">
                {formatTime(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
