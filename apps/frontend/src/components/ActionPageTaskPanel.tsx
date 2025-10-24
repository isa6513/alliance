import { ActionActivityDto, UserActionRelation } from "@alliance/shared/client";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import { isRouteErrorResponse, useOutletContext } from "react-router";
import { Route } from "../../.react-router/types/src/components/+types/ActionPageTaskPanel";
import ActionTaskPanel, { ActionTaskPanelProps } from "./ActionTaskPanel";
import ActionTaskPanelCompleted from "./ActionTaskPanelCompleted";
import ActionTaskPanelDeclined from "./ActionTaskPanelDeclined";
import TaskTimeInfo from "../pages/app/TaskTimeInfo";
import { getLastAndNextEvent } from "../pages/app/LargeActionCard";
import { getLatestEvent } from "@alliance/shared/lib/actionUtils";

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error(error);
  let errorText: string | undefined = undefined;
  if (isRouteErrorResponse(error)) {
    errorText = error.statusText;
  } else if (error instanceof Error) {
    errorText = error.name;
  }
  return (
    <Card>
      <p className="text-red-500 text-center">
        Error loading task: {errorText}
      </p>
    </Card>
  );
}

export interface TaskPanelContext
  extends Omit<ActionTaskPanelProps, "userRelation"> {
  userRelation: UserActionRelation | null;
  activities: ActionActivityDto[];
  handleLikeActivity: (activityId: number) => Promise<void>;
  setActivities: (activities: ActionActivityDto[]) => void;
}

const ActionPageTaskPanel = () => {
  const { userRelation, action, ...panelHandlers } =
    useOutletContext<TaskPanelContext>();

  if (!action.reqAuthenticated) {
    return (
      <Card style={CardStyle.Grey}>
        Log in or reload to interact with this action
      </Card>
    );
  }

  if (!userRelation || !action || !action.canParticipate) {
    return null;
  }

  if (userRelation === "completed") {
    return <ActionTaskPanelCompleted action={action} />;
  } else if (userRelation === "declined") {
    return <ActionTaskPanelDeclined />;
  }

  const latestEvent = getLatestEvent(action);
  const didMissDeadline =
    action.events.some((event) => event.newStatus === "member_action") &&
    (latestEvent?.newStatus === "office_action" ||
      latestEvent?.newStatus === "resolution");

  const { lastEvent, nextEvent } = getLastAndNextEvent(action);

  return (
    <>
      {didMissDeadline ? (
        <Card style={CardStyle.Grey}>
          <p className="font-bold">
            You missed the deadline to participate in this action.
          </p>
          <p>You can still complete it below if you would like.</p>
        </Card>
      ) : (
        <TaskTimeInfo
          action={action}
          nextEvent={nextEvent}
          lastEvent={lastEvent}
        />
      )}
      <ActionTaskPanel
        userRelation={userRelation}
        action={action}
        {...panelHandlers}
        card={true}
        missedDeadline={didMissDeadline}
      />
    </>
  );
};

export default ActionPageTaskPanel;
