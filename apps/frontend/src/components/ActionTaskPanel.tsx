import { ActionDto, UserActionRelation } from "@alliance/shared/client";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import posthog from "posthog-js";
import { useCallback } from "react";
import { useAuth } from "../lib/AuthContext";
import { canCompleteAction } from "../pages/app/HomePage";
import ActionTaskPanelActivity from "./ActionTaskPanelActivity";
import ActionTaskPanelCommit from "./ActionTaskPanelCommit";
import ActionTaskPanelForm from "./ActionTaskPanelForm";
import ActionTaskPanelFunding from "./ActionTaskPanelFunding";
import { StripeWrapper } from "./StripeWrapper";

interface ActionTaskPanelProps {
  action: ActionDto;
  userRelation: Extract<UserActionRelation, "joined" | "none">;
  handleCompleteAction: () => void;
  handleJoinAction: () => void;
  handleDeclineAction: (moral: boolean, reason: string) => void;
}

const ActionTaskPanel: React.FC<ActionTaskPanelProps> = ({
  action,
  userRelation,
  handleCompleteAction,
  handleJoinAction,
  handleDeclineAction,
}: ActionTaskPanelProps) => {
  const { isAuthenticated } = useAuth();

  const handleCompleteWithTracking = useCallback(() => {
    handleCompleteAction();
    posthog.capture("action_completed", {
      actionId: action.id,
      actionType: action.type,
      actionName: action.name,
    });
  }, [action, handleCompleteAction]);

  const handleFormStarted = useCallback(() => {
    posthog.capture("form_started", {
      actionId: action.id,
      actionType: action.type,
      actionName: action.name,
    });
  }, [action]);

  if (
    action.status === "gathering_commitments" ||
    action.status === "commitments_reached"
  ) {
    if (userRelation === "joined") {
      return (
        <Card style={CardStyle.Green}>
          <p>
            <span className="font-medium">
              You&apos;ve committed to participate.
            </span>{" "}
            We&apos;ll notify you when it&apos;s time to act.
          </p>
        </Card>
      );
    } else {
      if (!isAuthenticated) {
        return null;
      }
      return (
        <ActionTaskPanelCommit
          onCommit={handleJoinAction}
          onDecline={handleDeclineAction}
        />
      );
    }
  }

  if (canCompleteAction(action, userRelation)) {
    if (action.type === "Funding") {
      return (
        <StripeWrapper actionId={action.id}>
          <ActionTaskPanelFunding
            onPaymentSuccess={handleCompleteWithTracking}
          />
        </StripeWrapper>
      );
    }
    console.log("action.taskFormId", action.taskFormId);
    if (action.type === "Activity" && action.taskFormId) {
      return (
        <ActionTaskPanelForm
          taskFormId={action.taskFormId}
          onCompleteAction={handleCompleteWithTracking}
          onFormStarted={handleFormStarted}
        />
      );
    }
    if (action.type === "Activity" && !action.taskFormId) {
      return <p>Couldn&apos;t load action contents</p>;
    }
    if (action.type === "Ongoing") {
      return (
        <ActionTaskPanelActivity
          action={action}
          onCompleteAction={handleCompleteWithTracking}
        />
      );
    }
  }
  return null;
};

export default ActionTaskPanel;
