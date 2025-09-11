import { ActionDto } from "@alliance/shared/client";
import { formatDistance } from "date-fns";
import { useActionCount } from "../lib/useActionWebSocket";
import CompletedBar from "./CompletedBar";
import Timeline from "./system/Timeline";
import TimelineItem from "./system/TimelineItem";

export interface ActionEventsPanelProps {
  action: ActionDto;
  events: ActionDto["events"];
}

const ActionEventsPanel = ({ action, events }: ActionEventsPanelProps) => {
  const liveUserCount = useActionCount(action.id);

  return (
    <div className="flex flex-col gap-y-3 w-full">
      <p className="font-medium text-base text-black">Status</p>
      <Timeline>
        {events
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
                <div className="mb-2">
                  {action.status === "gathering_commitments" ? (
                    <div className="mt-4">
                      <p>
                        <span className="text-green text-sm">
                          {(
                            liveUserCount ?? action.usersJoined
                          )?.toLocaleString() || 0}{" "}
                          commitment{action.usersJoined === 1 ? "" : "s"} made
                        </span>
                        <span className="text-zinc-500 text-sm">
                          {" "}
                          of{" "}
                          {(
                            action.commitmentThreshold ?? 0
                          ).toLocaleString()}{" "}
                          needed
                        </span>
                      </p>
                      <CompletedBar
                        percentage={
                          ((liveUserCount ?? action.usersJoined) /
                            (action.commitmentThreshold ?? 1)) *
                          100
                        }
                      />
                    </div>
                  ) : action.status === "member_action" ? (
                    <div className="mt-4">
                      <p>
                        <span className="text-green text-sm">
                          {(action.usersCompleted ?? 0).toLocaleString()}{" "}
                          completed
                        </span>
                        {!action.commitmentless && (
                          <span className="text-zinc-500 text-sm">
                            {" "}
                            of {(action.usersJoined ?? 0).toLocaleString()}{" "}
                            committed
                          </span>
                        )}
                      </p>
                      <CompletedBar
                        percentage={
                          ((action.usersCompleted ?? 0) /
                            (action.usersJoined ?? 1)) *
                          100
                        }
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </>
          ))}
      </Timeline>
    </div>
  );
};

export default ActionEventsPanel;
