import { useNotifications } from "@alliance/shared/lib/useNotifications";
import { CardStyle } from "@alliance/shared/styles/card";
import Card from "@alliance/sharedweb/ui/Card";
import NotificationText from "../pages/app/NotificationText";
import { href, Link } from "react-router";
import { ArrowRight } from "lucide-react";

const HomeNotifsCard = () => {
  const { notifications, handleNotifClick } = useNotifications();

  const priority = notifications
    .filter((notification) => notification.priority === "high")
    .filter((notification) => !notification.readAt);

  if (priority.length === 0) {
    return null;
  }

  return (
    <Card
      style={CardStyle.White}
      className="gap-2 max-w-[500px] lg:max-w-[550px] mt-5 p-2!"
    >
      <div className="flex flex-row justify-between items-center p-3 pb-0">
        <p className="text-zinc-500 text-base">Recent notifications</p>
        <Link
          to={href("/notifications")}
          className="text-sm text-green hover:underline"
        >
          See all
        </Link>
      </div>
      <div className="flex flex-col divide-y divide-zinc-200">
        {priority.slice(0, 3).map((notification) => {
          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            handleNotifClick(notification.id, notification.webAppLocation)();
          };
          return (
            <div
              className="flex flex-row items-center justify-between gap-x-2 hover:bg-zinc-50 py-2 rounded-md text-base cursor-pointer p-3"
              key={notification.id}
              onClick={handleClick}
            >
              <NotificationText
                notification={notification}
                handleNotifClick={() => () => {}}
                className="py-2"
              />
              <ArrowRight size="16" className="shrink-0 text-green mx-2" />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default HomeNotifsCard;
