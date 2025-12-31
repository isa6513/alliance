import {
  ActionTaskPanelProps,
  useTaskFormHandlers,
} from "@alliance/shared/lib/actionTaskPanel";
import ActionTaskPanelForm from "./ActionTaskPanelForm";

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
