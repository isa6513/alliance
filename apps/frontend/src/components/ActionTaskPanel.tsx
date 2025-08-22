import { ActionActivityDto, UserActionRelation } from "@alliance/shared/client";
import { isRouteErrorResponse, useOutletContext } from "react-router";
import { Route } from "../../.react-router/types/src/components/+types/ActionTaskPanel";
import { useAuth } from "../lib/AuthContext";
import { useActionLoaderData } from "../pages/app/ActionPage";
import ActionCommitButton from "./ActionCommitButton";
import ActionTaskPanelActivity from "./ActionTaskPanelActivity";
import ActionTaskPanelCompleted from "./ActionTaskPanelCompleted";
import ActionTaskPanelForm from "./ActionTaskPanelForm";
import ActionTaskPanelFunding from "./ActionTaskPanelFunding";
import { StripeWrapper } from "./StripeWrapper";
import Card, { CardStyle } from "./system/Card";

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

const ActionTaskPanel = () => {
  const { handleCompleteAction, handleJoinAction, userRelation } =
    useOutletContext<TaskPanelContext>();

  const action = useActionLoaderData();

  const { isAuthenticated } = useAuth();

  if (!action) {
    return null;
  }

  if (userRelation === "completed") {
    return <ActionTaskPanelCompleted />;
  }

  if (action.status === "gathering_commitments") {
    if (userRelation === "joined") {
      return (
        <Card style={CardStyle.Green}>
          <p>
            <b>Committed </b>- We&apos;ll notify you when it&apos;s time to act.
          </p>
        </Card>
      );
    } else {
      if (!isAuthenticated) {
        return null;
      }
      return (
        <Card
          style={CardStyle.White}
          className="flex-row items-center gap-x-2 justify-between"
        >
          <span>Ready to join?</span>
          <ActionCommitButton
            committed={false}
            isAuthenticated={true}
            onCommit={handleJoinAction}
          />
        </Card>
      );
    }
  }

  if (action.status === "member_action" && userRelation === "joined") {
    if (action.type === "Funding") {
      return (
        <StripeWrapper actionId={action.id}>
          <ActionTaskPanelFunding onPaymentSuccess={handleCompleteAction} />
        </StripeWrapper>
      );
    }
    if (action.type === "Activity" && action.taskForm) {
      return (
        <ActionTaskPanelForm
          actionTaskForm={action.taskForm}
          onCompleteAction={handleCompleteAction}
        />
      );
    }
    if (action.type === "Ongoing") {
      return (
        <ActionTaskPanelActivity
          action={action}
          onCompleteAction={handleCompleteAction}
        />
      );
    }
  }
  return null;
};

export default ActionTaskPanel;
