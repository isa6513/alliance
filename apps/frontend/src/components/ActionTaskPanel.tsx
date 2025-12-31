import Card from "@alliance/sharedweb/ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import { useMemo } from "react";
import { useAuth } from "../lib/AuthContext";
import { canCompleteAction } from "@alliance/shared/lib/homePage";
import ActionTaskPanelActivity from "./ActionTaskPanelActivity";
import ActionTaskPanelCommit from "./ActionTaskPanelCommit";
import ActionTaskPanelForm from "./ActionTaskPanelForm";
import ActionTaskPanelFunding from "./ActionTaskPanelFunding";
import { StripeWrapper } from "./StripeWrapper";
import {
  ActionTaskPanelProps,
  useTaskFormHandlers,
} from "@alliance/shared/lib/actionTaskPanel";

const ActionTaskPanel: React.FC<ActionTaskPanelProps> = ({
  action,
  userRelation,
  missedDeadline = false,
  onCompleteAction,
  onJoinAction,
  onDeclineAction,
  onOptOutAction,
  card = false,
  disabled = false,
}: ActionTaskPanelProps) => {
  const { isAuthenticated } = useAuth();

  const {
    handleCompleteWithTracking,
    actionError,
    handleFormStarted,
    handleAbandonAction,
    handleJoinAction,
    handleDeclineAction,
  } = useTaskFormHandlers({
    action,
    onCompleteAction,
    userRelation,
    onJoinAction,
    onDeclineAction,
    onOptOutAction,
  });

  const errorMessageNode = useMemo(() => {
    if (!actionError) {
      return null;
    }
    return (
      <p className="mt-2 text-sm text-red-600" role="alert">
        {actionError}
      </p>
    );
  }, [actionError]);

  if (disabled && action.taskFormId) {
    return (
      <ActionTaskPanelForm
        taskFormId={action.taskFormId}
        onCompleteAction={null}
        onFormStarted={handleFormStarted}
        onAbandonAction={handleAbandonAction}
        card={card}
        actionId={action.id}
        disabled={true}
      />
    );
  }

  if (
    (action.status === "gathering_commitments" ||
      action.status === "office_action") &&
    !missedDeadline
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
        <>
          <ActionTaskPanelCommit
            onCommit={handleJoinAction}
            onDecline={handleDeclineAction}
          />
          {errorMessageNode}
        </>
      );
    }
  }
  let completionElement = null;
  if (canCompleteAction(action)) {
    if (action.type === "Funding") {
      completionElement = (
        <StripeWrapper actionId={action.id}>
          <ActionTaskPanelFunding
            onPaymentSuccess={handleCompleteWithTracking}
          />
        </StripeWrapper>
      );
    }
    if (action.type === "Activity" && action.taskFormId) {
      completionElement = (
        <ActionTaskPanelForm
          publicAction={action.publicOnly}
          taskFormId={action.taskFormId}
          onCompleteAction={handleCompleteWithTracking}
          onFormStarted={handleFormStarted}
          onAbandonAction={handleAbandonAction}
          card={card}
          actionId={action.id}
        />
      );
    }
    if (action.type === "Activity" && !action.taskFormId) {
      completionElement = <p>Couldn&apos;t load action contents</p>;
    }
    if (action.type === "Ongoing") {
      completionElement = (
        <ActionTaskPanelActivity
          action={action}
          onCompleteAction={handleCompleteWithTracking}
        />
      );
    }
    if (completionElement) {
      return (
        <>
          {completionElement}
          {errorMessageNode}
        </>
      );
    }
  }

  if (action.status === "draft") {
    return (
      <>
        {action.taskFormId && (
          <ActionTaskPanelForm
            taskFormId={action.taskFormId}
            onCompleteAction={null}
            onFormStarted={handleFormStarted}
            onAbandonAction={handleAbandonAction}
            card={card}
            actionId={action.id}
          />
        )}
        {errorMessageNode}
      </>
    );
  }

  return errorMessageNode;
};

export default ActionTaskPanel;
