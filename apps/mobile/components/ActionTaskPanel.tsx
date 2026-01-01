import {
  ActionTaskPanelProps,
  useTaskFormHandlers,
} from "@alliance/shared/lib/actionTaskPanel";
import ActionTaskPanelForm from "./ActionTaskPanelForm";
import { useCallback } from "react";
import { usePostHog } from "posthog-react-native";

const ActionTaskPanel = ({
  action,
  userRelation,
  onCompleteAction,
  onJoinAction,
  onDeclineAction,
  onOptOutAction,
}: ActionTaskPanelProps) => {
  const {
    handleCompleteWithTracking,
    actionError,
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

  const posthog = usePostHog();

  const handleFormStarted = useCallback(() => {
    posthog.capture("form_started", {
      actionId: action.id,
      actionType: action.type,
      actionName: action.name,
    });
  }, [action, posthog]);

  if (action.taskFormId) {
    return (
      <ActionTaskPanelForm
        taskFormId={action.taskFormId}
        onCompleteAction={handleCompleteWithTracking}
        onFormStarted={handleFormStarted}
        onAbandonAction={handleAbandonAction}
        actionId={action.id}
      />
    );
  }

  return null;
};

export default ActionTaskPanel;
