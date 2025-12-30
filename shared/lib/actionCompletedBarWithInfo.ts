import { ActionDto } from "../client/types.gen";

export interface ActionCompletedBarWithInfoPropsShared {
  action: Pick<
    ActionDto,
    | "commitmentThreshold"
    | "status"
    | "everyoneShouldComplete"
    | "usersCompleted"
    | "usersJoined"
  >;
  friendActivities: ActionActivityDto[] | null;
}

export function getCompletedPercentage(
  action: Pick<
    ActionDto,
    | "commitmentThreshold"
    | "status"
    | "everyoneShouldComplete"
    | "usersCompleted"
    | "usersJoined"
  >
) {
  const value =
    action.status === "gathering_commitments"
      ? action.usersJoined
      : action.usersCompleted;

  const threshold =
    action.status === "gathering_commitments"
      ? action.commitmentThreshold
      : action.usersJoined;

  if (!threshold) {
    return { labelString: "", percentage: null };
  }

  const safeThreshold = Math.max(threshold, value);

  const labelString = action.everyoneShouldComplete
    ? value
    : `${value} / ${safeThreshold}`;

  const percentage =
    (value / (action.everyoneShouldComplete ? value : safeThreshold)) * 100;

  return { labelString, percentage };
}
