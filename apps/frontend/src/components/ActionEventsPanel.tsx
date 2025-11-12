import { ActionDto } from "@alliance/shared/client";
import { formatDistance } from "date-fns";
import Timeline from "./system/Timeline";
import TimelineItem from "./system/TimelineItem";
import { Fragment } from "react";

export interface ActionEventsPanelProps {
  action: ActionDto;
  events: ActionDto["events"];
}

const ActionEventsPanel = ({ action, events }: ActionEventsPanelProps) => {
  if (action.status === "draft" && events.length === 0) {
    events.push({
      id: 0,
      title: "Draft",
      description: "This action is being viewed as a draft preview",
      date: new Date().toISOString(),
      newStatus: "draft",
      showInTimeline: true,
      suiteManaged: false,
    });
  }

  const chronologicallySortedEvents = events
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const currentEventId = chronologicallySortedEvents
    .filter((event) => new Date(event.date).getTime() <= new Date().getTime())
    .pop()?.id;

  const currentEventIndex = chronologicallySortedEvents.findIndex(
    (event) => event.id === currentEventId
  );

  return (
    <div className="flex flex-col gap-y-3 w-full">
      <Timeline currentIdx={currentEventIndex}>
        {chronologicallySortedEvents.slice().map((event) => (
          <Fragment key={event.id}>
            <TimelineItem
              title={event.title}
              description={event.description}
              current={event.id === currentEventId}
              time={formatDistance(event.date, new Date(), {
                addSuffix: true,
              })}
            />
          </Fragment>
        ))}
      </Timeline>
    </div>
  );
};

export default ActionEventsPanel;
