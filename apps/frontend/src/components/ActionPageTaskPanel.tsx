import { ActionActivityDto, UserActionRelation } from "@alliance/shared/client";
import Card from "@alliance/shared/ui/Card";
import { isRouteErrorResponse, useOutletContext } from "react-router";
import { Route } from "../../.react-router/types/src/components/+types/ActionPageTaskPanel";
import { useActionLoaderData } from "../pages/app/ActionPage";
import ActionTaskPanel from "./ActionTaskPanel";
import ActionTaskPanelCompleted from "./ActionTaskPanelCompleted";
import ActionTaskPanelDeclined from "./ActionTaskPanelDeclined";

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

export type TaskPanelContext = {
  handleCompleteAction: () => void;
  handleJoinAction: () => void;
  handleDeclineAction: (moral: boolean, reason: string) => void;
  userRelation: UserActionRelation | null;
  activities: ActionActivityDto[];
  handleLikeActivity: (activityId: number) => Promise<void>;
  setActivities: React.Dispatch<React.SetStateAction<ActionActivityDto[]>>;
};

const ActionPageTaskPanel = () => {
  const {
    handleCompleteAction,
    handleJoinAction,
    handleDeclineAction,
    userRelation,
  } = useOutletContext<TaskPanelContext>();
  const action = useActionLoaderData();

  if (!userRelation) {
    return null;
  }

  console.log("userRelation", userRelation);

  if (userRelation === "completed") {
    return <ActionTaskPanelCompleted />;
  }

  if (userRelation === "declined") {
    return <ActionTaskPanelDeclined />;
  }

  return (
    <ActionTaskPanel
      action={action}
      userRelation={userRelation}
      handleCompleteAction={handleCompleteAction}
      handleJoinAction={handleJoinAction}
      handleDeclineAction={handleDeclineAction}
    />
  );
};

export default ActionPageTaskPanel;
