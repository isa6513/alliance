import { ActionStatus } from 'src/actions/entities/action-event.entity';
import { Action } from 'src/actions/entities/action.entity';
import { actionUrl } from 'src/search/approutes';
import { User } from 'src/user/user.entity';

type announcedStates =
  | ActionStatus.GatheringCommitments
  | ActionStatus.MemberAction;

export const defaultEventTextAnnouncement: {
  [x in announcedStates]: (user: User, action: Action) => string;
} = {
  [ActionStatus.GatheringCommitments]: (user, action) =>
    `new action: ${action.name}. Please confirm commitment at ${actionUrl(action.id, true)}. Reply STOP to opt out.`,
  [ActionStatus.MemberAction]: (user, action) =>
    `An action you committed to needs to be completed: ${action.name}. ${actionUrl(action.id, true)}. Reply STOP to opt out.`,
};

export const defaultEventText3DayReminder: {
  [x in announcedStates]: (user: User, action: Action) => string;
} = {
  [ActionStatus.GatheringCommitments]: (user, action) =>
    `You have 3 days left to confirm participation in: ${action.name}. ${actionUrl(action.id, true)}. Reply STOP to opt out.`,
  [ActionStatus.MemberAction]: (user, action) =>
    `You have 3 days left to ${action.commitmentless ? 'complete' : 'fulfill your commitment to'}: ${action.name}. ${actionUrl(action.id, true)}. Reply STOP to opt out.`,
};

export const defaultEventText1DayReminder: {
  [x in announcedStates]: (user: User, action: Action) => string;
} = {
  [ActionStatus.GatheringCommitments]: (user, action) =>
    `You have 1 day left to confirm participation in: ${action.name}. ${actionUrl(action.id, true)}. Reply STOP to opt out.`,
  [ActionStatus.MemberAction]: (user, action) =>
    `You have 1 day left to ${action.commitmentless ? 'complete' : 'fulfill your commitment to'}: ${action.name}. ${actionUrl(action.id, true)}. Reply STOP to opt out.`,
};
