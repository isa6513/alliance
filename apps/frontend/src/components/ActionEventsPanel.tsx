import { ActionDto } from "@alliance/shared/client";
import { formatDistance } from "date-fns";
import Timeline from "./system/Timeline";
import TimelineItem from "./system/TimelineItem";

export interface ActionEventsPanelProps {
  events: ActionDto["events"];
}

const ActionEventsPanel = ({ events }: ActionEventsPanelProps) => {
  return (
    <div className="flex flex-col gap-y-3 w-full">
      <p className="text-base font-semibold">Updates</p>
      <Timeline>
        {events
          .slice()
          .reverse()
          .map((event) => (
            <TimelineItem
              key={event.id}
              title={event.title}
              description={event.description}
              time={formatDistance(event.date, new Date(), {
                addSuffix: true,
              })}
            />
          ))}
      </Timeline>
    </div>
  );
};

export default ActionEventsPanel;
