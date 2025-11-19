import {
  ActionDto,
  ActionEventDto,
  ActionUpdateDto,
} from "@alliance/shared/client";
import { formatDistance } from "date-fns";
import Timeline from "./system/Timeline";
import TimelineItem from "./system/TimelineItem";
import { Fragment } from "react";
import ActionUpdateCard from "@alliance/shared/ui/ActionUpdateCard";

export interface ActionEventsPanelProps {
  action: ActionDto;
}

const ActionEventsPanel = ({ action }: ActionEventsPanelProps) => {
  const events = action.events;
  const updates = action.updates;

  if (action.status === "draft" && events.length === 0) {
    events.push({
      id: 0,
      title: "Draft",
      description: "This action is being viewed as a draft preview",
      date: new Date().toISOString(),
      newStatus: "draft",
      suiteManaged: false,
    });
  }

  const interleaved: (ActionEventDto | ActionUpdateDto)[] = [
    ...events,
    ...updates,
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log(events);
  console.log(updates);
  console.log(
    interleaved.map((event) => ("newStatus" in event ? "event" : "update"))
  );

  const currentEventId = interleaved
    .filter((event): event is ActionEventDto => "newStatus" in event)
    .filter((event) => new Date(event.date).getTime() <= new Date().getTime())
    .pop()?.id;

  const currentEventIndex = interleaved
    .filter((event): event is ActionEventDto => "newStatus" in event)
    .findIndex((event) => event.id === currentEventId);

  return (
    <div className="flex flex-col gap-y-3 w-full">
      <Timeline currentIdx={currentEventIndex}>
        {interleaved.slice().map((event) => (
          <Fragment key={event.id}>
            {"newStatus" in event ? (
              <TimelineItem
                title={event.title}
                description={event.description}
                current={event.id === currentEventId}
                time={formatDistance(event.date, new Date(), {
                  addSuffix: true,
                })}
              />
            ) : (
              <ActionUpdateCard key={event.id} update={event} />
            )}
          </Fragment>
        ))}
      </Timeline>
    </div>
  );
};

export default ActionEventsPanel;
