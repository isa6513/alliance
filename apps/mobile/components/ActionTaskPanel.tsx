import {
  ActionTaskPanelPropsShared,
  useTaskFormHandlers,
} from "@alliance/shared/lib/actionTaskPanel";
import { noop } from "@alliance/shared/lib/constants";
import ActionTaskPanelForm from "./ActionTaskPanelForm";
import { useCallback } from "react";
import { usePostHog } from "posthog-react-native";

export type ActionTaskPanelProps = Pick<
  ActionTaskPanelPropsShared,
  | "action"
  | "onCompleteAction"
  | "onJoinAction"
  | "onDeclineAction"
  | "onOptOutAction"
  | "disabled"
  | "formResponse"
> & {
  scrollPageTo: (y: number, animated?: boolean) => void;
  scrollToEnd: (animated?: boolean) => void;
  onSubmitSuccess?: () => void;
};

const ActionTaskPanel = ({
  action,
  onCompleteAction,
  onJoinAction,
  onDeclineAction,
  onOptOutAction,
  scrollPageTo,
  scrollToEnd,
  disabled,
  formResponse,
  onSubmitSuccess = noop,
}: ActionTaskPanelProps) => {
  const { handleCompleteWithTracking, handleAbandonAction } =
    useTaskFormHandlers({
      action,
      onCompleteAction,
      onJoinAction,
      onDeclineAction,
      onOptOutAction,
    });

  const posthog = usePostHog();

  const handleFormStarted = useCallback(() => {
    if (!posthog) return;
    posthog.capture("form_started", {
      actionId: action.id,
      actionType: action.type,
      actionName: action.name,
    });
  }, [action, posthog]);

  if ((disabled || formResponse) && action.taskFormId !== undefined) {
    return (
      <ActionTaskPanelForm
        taskFormId={action.taskFormId}
        scrollPageTo={scrollPageTo}
        scrollToEnd={scrollToEnd}
        onCompleteAction={null}
        onFormStarted={handleFormStarted}
        onAbandonAction={handleAbandonAction}
        actionId={action.id}
        onSubmitSuccess={onSubmitSuccess}
        disabled={true}
        formResponse={formResponse}
      />
    );
  }

  if (action.taskFormId) {
    return (
      <ActionTaskPanelForm
        taskFormId={action.taskFormId}
        scrollPageTo={scrollPageTo}
        scrollToEnd={scrollToEnd}
        onCompleteAction={handleCompleteWithTracking}
        onFormStarted={handleFormStarted}
        onAbandonAction={handleAbandonAction}
        actionId={action.id}
        onSubmitSuccess={onSubmitSuccess}
        disabled={disabled}
      />
    );
  }

  return null;
};

export default ActionTaskPanel;
