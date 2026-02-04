import { ActionDto, UserActionRelation } from "../client/types.gen";
import { getLatestEvent } from "./actionUtils";

export enum ActionPageTaskPanelState {
  PublicOnly = "public_only",
  NotAuthenticated = "not_authenticated",
  OnboardingSignContractFirst = "onboarding_sign_contract_first",
  NotAssigned = "not_assigned",
  Completed = "completed",
  Declined = "declined",
  MemberActionClosed = "member_action_closed",
  MissingDataOrNotActive = "missing_data_or_not_active",
  ShowTaskWithMissedDeadline = "show_task_with_missed_deadline",
  ShowTask = "show_task",
}

export function getActionPageTaskPanelState(
  action: ActionDto,
  userRelation: UserActionRelation | null,
  contractSigned: boolean
): ActionPageTaskPanelState {
  if (action.publicOnly) return ActionPageTaskPanelState.PublicOnly;

  if (!action.reqAuthenticated)
    return ActionPageTaskPanelState.NotAuthenticated;

  if (
    !action.canParticipate &&
    !action.preventCompletion
  )
    return ActionPageTaskPanelState.NotAssigned;

  if (action.onboarding && !contractSigned && !action.isContractSigningAction) {
    return ActionPageTaskPanelState.OnboardingSignContractFirst;
  }

  if (
    !userRelation ||
    !action ||
    (!action.canParticipate && !action.preventCompletion)
  )
    return ActionPageTaskPanelState.MissingDataOrNotActive;

  if (userRelation === "completed") {
    return ActionPageTaskPanelState.Completed;
  } else if (userRelation === "declined") {
    return ActionPageTaskPanelState.Declined;
  }

  if (!action.canParticipate) {
    return ActionPageTaskPanelState.MemberActionClosed;
  }

  const latestEvent = getLatestEvent(action);
  const didMissDeadline =
    action.events.some((event) => event.newStatus === "member_action") &&
    (latestEvent?.newStatus === "office_action" ||
      latestEvent?.newStatus === "resolution");

  if (didMissDeadline) {
    return ActionPageTaskPanelState.ShowTaskWithMissedDeadline;
  }

  return ActionPageTaskPanelState.ShowTask;
}
