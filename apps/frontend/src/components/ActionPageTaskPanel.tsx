import { ActionActivityDto, UserActionRelation } from "@alliance/shared/client";
import Card from "@alliance/shared/ui/Card";
import { isRouteErrorResponse, useOutletContext } from "react-router";
import { Route } from "../../.react-router/types/src/components/+types/ActionPageTaskPanel";
import { useActionLoaderData } from "../pages/app/ActionPage";
import ActionTaskPanel from "./ActionTaskPanel";
import ActionTaskPanelCompleted from "./ActionTaskPanelCompleted";

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
  userRelation: UserActionRelation | null;
  activities: ActionActivityDto[];
  handleLikeActivity: (activityId: number) => Promise<void>;
  setActivities: React.Dispatch<React.SetStateAction<ActionActivityDto[]>>;
};

const ActionPageTaskPanel = () => {
  const { handleCompleteAction, handleJoinAction, userRelation } =
    useOutletContext<TaskPanelContext>();
  const action = useActionLoaderData();

  if (!userRelation) {
    return null;
  }

  if (userRelation === "completed") {
    return <ActionTaskPanelCompleted />;
  }

  return (
    <ActionTaskPanel
      action={action}
      userRelation={userRelation}
      handleCompleteAction={handleCompleteAction}
      handleJoinAction={handleJoinAction}
    />
  );
};

export default ActionPageTaskPanel;
