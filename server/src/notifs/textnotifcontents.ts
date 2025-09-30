import { ActionStatus } from 'src/actions/entities/action-event.entity';
import { actionUrl, withCid } from 'src/search/approutes';
import { ActionEventNotificationContext } from './action-event-notif.worker';

type announcedStates =
  | ActionStatus.GatheringCommitments
  | ActionStatus.MemberAction;

export const defaultEventTextAnnouncement: {
  [x in announcedStates]: (context: ActionEventNotificationContext) => string;
} = {
  [ActionStatus.GatheringCommitments]: (context) =>
    `new action: ${context.action.name}. Please confirm commitment at ${withCid(actionUrl(context.action.id, true), context.cid)}. Reply STOP to opt out.`,
  [ActionStatus.MemberAction]: (context) =>
    `An action you committed to is ready to be completed: ${context.action.name}. ${withCid(actionUrl(context.action.id, true), context.cid)}. Reply STOP to opt out.`,
};

export const defaultEventText3DayReminder: {
  [x in announcedStates]: (context: ActionEventNotificationContext) => string;
} = {
  [ActionStatus.GatheringCommitments]: (context) =>
    `You have 3 days left to confirm participation in: ${context.action.name}. ${withCid(actionUrl(context.action.id, true), context.cid)}. Reply STOP to opt out.`,
  [ActionStatus.MemberAction]: (context) =>
    `You have 3 days left to ${context.action.commitmentless ? 'complete' : 'fulfill your commitment to'}: ${context.action.name}. ${withCid(actionUrl(context.action.id, true), context.cid)}. Reply STOP to opt out.`,
};

export const defaultEventText1DayReminder: {
  [x in announcedStates]: (context: ActionEventNotificationContext) => string;
} = {
  [ActionStatus.GatheringCommitments]: (context) =>
    `You have 1 day left to confirm participation in: ${context.action.name}. ${withCid(actionUrl(context.action.id, true), context.cid)}. Reply STOP to opt out.`,
  [ActionStatus.MemberAction]: (context) =>
    `You have 1 day left to ${context.action.commitmentless ? 'complete' : 'fulfill your commitment to'}: ${context.action.name}. ${withCid(actionUrl(context.action.id, true), context.cid)}. Reply STOP to opt out.`,
};

export const defaultEventTextMissedDeadline = (
  context: ActionEventNotificationContext,
) =>
  `You failed to complete: ${context.action.name}. The deadline has now passed. Reply STOP to opt out.`;

export const defaultEventTextMissedSecondDeadline = (
  context: ActionEventNotificationContext,
) =>
  `You failed to complete: ${context.action.name}. As you have not completed two actions in a row, you are no longer an active Alliance member. Reply STOP to opt out.`;
