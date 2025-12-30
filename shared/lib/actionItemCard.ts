import { ActionActivityDto, ActionDto } from "../client";

export function showCompletedBar(
  action: Pick<ActionDto, "status" | "everyoneShouldComplete">
) {
  return (
    (action.status === "member_action" ||
      action.status === "gathering_commitments") &&
    !action.everyoneShouldComplete
  );
}

export interface ActionItemCardPropsShared {
  action: Pick<
    ActionDto,
    | "name"
    | "shortDescription"
    | "category"
    | "id"
    | "status"
    | "commitmentThreshold"
    | "everyoneShouldComplete"
    | "usersJoined"
    | "userRelation"
    | "usersCompleted"
    | "squareThumbnailImage"
    | "squareThumbnailImageAlt"
  >;
  friendCommitmentActivities?: ActionActivityDto[];
}
