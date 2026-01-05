import { ActionDto, ActionEventDto, UserAwayRangeDto } from "../client";

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

export function getActionEventAt(
  action: ActionDto,
  date: Date
): { event: ActionEventDto | null; endDate: Date | null } {
  const event = action.events.find((event) => new Date(event.date) <= date);
  const nextEvent = action.events.find((event) => new Date(event.date) > date);

  return {
    event: event ?? null,
    endDate: nextEvent ? new Date(nextEvent.date) : null,
  };
}

export enum TaskAwayStatus {
  AWAY_PREVIOUSLY = "away_previously",
  AWAY_CURRENTLY = "away_currently",
  AWAY_LATER = "away_later",
  NOT_AWAY = "not_away",
}

export function getAwayStatus(
  action: ActionDto,
  awayRanges: UserAwayRangeDto[],
  date: Date
): TaskAwayStatus {
  const { event, endDate } = getActionEventAt(action, date);
  if (!event) {
    return TaskAwayStatus.NOT_AWAY;
  }
  const startDate = new Date(event.date);

  for (const awayRange of awayRanges) {
    const awayStartDate = new Date(awayRange.startDate);
    const awayEndDate = new Date(awayRange.endDate);
    if (awayStartDate <= date && date < awayEndDate) {
      return TaskAwayStatus.AWAY_CURRENTLY;
    }

    if (startDate < awayEndDate && awayEndDate < date) {
      return TaskAwayStatus.AWAY_PREVIOUSLY;
    }

    if (date <= awayStartDate && (!endDate || awayStartDate < endDate)) {
      return TaskAwayStatus.AWAY_LATER;
    }
  }
  return TaskAwayStatus.NOT_AWAY;
}

export type ActionWithAwayStatus = ActionDto & { awayStatus: TaskAwayStatus };
