import { useNotifications } from "@alliance/shared/lib/useNotifications";
import List from "@alliance/sharedweb/ui/List";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import NotificationText from "./NotificationText";

const NotificationsPage = () => {
  const { notifications, handleMarkAllAsRead, handleNotifClick } =
    useNotifications();

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt
  ).length;

  return (
    <CenterLayout>
      <div className="flex flex-col items-center w-[calc(min(650px,100%))] gap-y-6">
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
            <NotificationText key={notification.id} notification={notification} handleNotifClick={handleNotifClick} className={`hover:bg-zinc-100 p-4 flex cursor-pointer flex-col gap-y-2 ${notification.readAt ? "bg-white" : "bg-red-50"}`} />
          ))}
        </List>
      </div>
    </CenterLayout>
  );
};

export default NotificationsPage;
