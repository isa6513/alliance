import { ActionDto } from "../client";

export enum FilterMode {
  All = "All",
  GatheringCommitments = "Gathering commitments",
  MemberAction = "Members taking action",
  PendingOfficeResolution = "Pending office resolution",
  Past = "Past",
}

export const getPastEvents = (action: ActionDto) => {
  return action.events.filter((event) => new Date(event.date) <= new Date());
};

export const getLatestEvent = (action: ActionDto) => {
  const pastEvents = getPastEvents(action);
  return pastEvents.length > 0
    ? pastEvents.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0]
    : null;
};
