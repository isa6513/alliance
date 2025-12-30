import { ActionDto } from "../client";
import { FilterMode } from "./actionUtils";

export const filterActions = (
  actions: ActionDto[],
  mode: FilterMode
): ActionDto[] => {
  switch (mode) {
    case FilterMode.All:
      return actions.filter((action) => action.status !== "planned");
    case FilterMode.GatheringCommitments:
      return actions.filter(
        (action) => action.status === "gathering_commitments"
      );
    case FilterMode.PendingOfficeResolution:
      return actions.filter((action) => action.status === "office_action");
    case FilterMode.MemberAction:
      return actions.filter(
        (action) =>
          action.status === "member_action" && !action.everyoneShouldComplete
      );
    case FilterMode.Past:
      return actions.filter(
        (action) => action.status === "completed" || action.status === "failed"
      );
    default:
      const x: never = mode;
      throw new Error(`Invalid filter mode: ${x}`);
  }
};
