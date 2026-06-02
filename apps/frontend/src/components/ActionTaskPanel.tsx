import { AnalyticsEvent } from "@alliance/common/analytics";
import { FormResponseDto, UserActionRelation } from "@alliance/shared/client";
import {
  ActionTaskPanelPropsShared,
  useTaskFormHandlers,
} from "@alliance/shared/lib/actionTaskPanel";
import { canCompleteAction } from "@alliance/shared/lib/actionUtils";
import { captureEvent } from "@alliance/shared/lib/analytics";
import { useCallback, useMemo, type RefObject } from "react";
import ActionTaskPanelActivity from "./ActionTaskPanelActivity";
import ActionTaskPanelForm from "./ActionTaskPanelForm";

export type ActionTaskPanelProps = ActionTaskPanelPropsShared & {
  userRelation: UserActionRelation;
  missedDeadline?: boolean;
  card?: boolean;
  redirectOnComplete?: boolean;
  onFormSubmitted?: (formResponse: FormResponseDto) => void;
  createAccountHref?: string;
  forceRenderTask?: boolean;
  scrollContainerRef?: RefObject<HTMLElement | null>;
};

const ActionTaskPanel: React.FC<ActionTaskPanelProps> = ({
  action,
  onCompleteAction,
  onOptOutAction,
  card = false,
  disabled = false,
  formResponse,
  guestMode = false,
  redirectOnComplete,
  onFormSubmitted,
  createAccountHref,
  forceRenderTask = false,
  scrollContainerRef,
}: ActionTaskPanelProps) => {
  const handleCompleteAction = useCallback(async () => {
    const didSucceed = await onCompleteAction();
    if (didSucceed === false) {
      return false;
    }
    captureEvent(AnalyticsEvent.ActionCompleted, {
      actionId: action.id,
      actionType: action.type,
      actionName: action.name,
    });
    return true;
  }, [onCompleteAction, action.id, action.type, action.name]);

  const handleFormStarted = useCallback(() => {
    captureEvent(AnalyticsEvent.FormStarted, {
      actionId: action.id,
      actionType: action.type,
      actionName: action.name,
    });
  }, [action]);

  const { handleCompleteWithTracking, actionError, handleAbandonAction } =
    useTaskFormHandlers({
      action,
      onCompleteAction: handleCompleteAction,
      onOptOutAction,
      guestMode,
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

  if ((disabled || formResponse) && action.taskFormId !== undefined) {
    return (
      <ActionTaskPanelForm
        taskFormId={action.taskFormId}
        onCompleteAction={null}
        onFormStarted={handleFormStarted}
        onAbandonAction={handleAbandonAction}
        card={card}
        actionId={action.id}
        disabled={true}
        formResponse={formResponse}
        onSubmitted={onFormSubmitted}
      />
    );
  }

  const canSubmit = canCompleteAction(action) || forceRenderTask;

  let completionElement = null;
  if (action.type === "Activity" && action.taskFormId) {
    completionElement = (
      <ActionTaskPanelForm
        publicAction={action.publicOnly || guestMode}
        taskFormId={action.taskFormId}
        onCompleteAction={canSubmit ? handleCompleteWithTracking : null}
        onFormStarted={handleFormStarted}
        onAbandonAction={handleAbandonAction}
        card={card}
        actionId={action.id}
        redirectOnComplete={redirectOnComplete}
        onSubmitted={onFormSubmitted}
        scrollContainerRef={scrollContainerRef}
        disabled={disabled || !canSubmit}
      />
    );
  }
  if (action.type === "Activity" && !action.taskFormId) {
    completionElement = <p>Couldn&apos;t load action contents</p>;
  }
  if (action.type === "Ongoing" && (canSubmit || forceRenderTask)) {
    completionElement = (
      <ActionTaskPanelActivity
        action={action}
        onCompleteAction={handleCompleteWithTracking}
        disabled={disabled || !canSubmit}
        createAccountHref={guestMode ? createAccountHref : undefined}
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
