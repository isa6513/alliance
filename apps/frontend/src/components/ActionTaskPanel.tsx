import { useAuth } from "../lib/AuthContext";

import { ActionDto, UserActionRelation } from "@alliance/shared/client";
import ActionTaskPanelForm from "./ActionTaskPanelForm";

import Card, { CardStyle } from "@alliance/shared/ui/Card";
import ActionCommitButton from "./ActionCommitButton";
import ActionTaskPanelActivity from "./ActionTaskPanelActivity";
import ActionTaskPanelFunding from "./ActionTaskPanelFunding";
import { StripeWrapper } from "./StripeWrapper";

interface ActionTaskPanelProps {
  action: ActionDto;
  userRelation: Extract<UserActionRelation, "joined" | "none">;
  handleCompleteAction: () => void;
  handleJoinAction: () => void;
}

const ActionTaskPanel: React.FC<ActionTaskPanelProps> = ({
  action,
  userRelation,
  handleCompleteAction,
  handleJoinAction,
}: ActionTaskPanelProps) => {
  const { isAuthenticated } = useAuth();

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
        <ActionCommitButton
          committed={false}
          isAuthenticated={true}
          onCommit={handleJoinAction}
        />
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
    console.log("action.taskFormId", action.taskFormId);
    if (action.type === "Activity" && action.taskFormId) {
      return (
        <ActionTaskPanelForm
          taskFormId={action.taskFormId}
          onCompleteAction={handleCompleteAction}
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
          onCompleteAction={handleCompleteAction}
        />
      );
    }
  }
  return null;
};

export default ActionTaskPanel;
