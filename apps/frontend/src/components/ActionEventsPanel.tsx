import { ActionDto } from "@alliance/shared/client";
import { formatDistance } from "date-fns";
import Timeline from "./system/Timeline";
import TimelineItem from "./system/TimelineItem";
import ActionCompletedBarWithInfo from "../pages/app/ActionCompletedBarWithInfo";

export interface ActionEventsPanelProps {
  action: ActionDto;
  events: ActionDto["events"];
}

const ActionEventsPanel = ({ action, events }: ActionEventsPanelProps) => {
  const pastEvents = events
    .filter((event) => new Date(event.date) < new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (action.status === "draft" && events.length === 0) {
    pastEvents.push({
      id: 0,
      title: "Draft",
      description: "This action is being viewed as a draft preview",
      date: new Date().toISOString(),
      newStatus: "draft",
      sendNotifsTo: "none",
      showInTimeline: true,
    });
  }

  return (
    <div className="flex flex-col gap-y-3 w-full">
      <p className="font-semibold font-serif text-xl text-black">Stage</p>
      <Timeline>
        {pastEvents
          .slice()
          .reverse()
          .map((event, idx) => (
            <>
              <TimelineItem
                key={event.id}
                title={event.title}
                description={event.description}
                first={idx === 0}
                time={formatDistance(event.date, new Date(), {
                  addSuffix: true,
                })}
              />
              {idx === 0 && (
                <ActionCompletedBarWithInfo
                  action={action}
                  friendActivities={null}
                  className="mt-4"
                />
              )}
            </>
          ))}
      </Timeline>
    </div>
  );
};

export default ActionEventsPanel;
