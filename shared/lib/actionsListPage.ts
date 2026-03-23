import { ActionDto, actionsFindAllLoggedIn } from "../client";
import { FilterMode } from "./actionUtils";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

export const useActionsQuery = (): UseQueryResult<ActionDto[], Error> =>
  useQuery({
    queryKey: ["actions"],
    queryFn: () =>
      actionsFindAllLoggedIn({ query: { sorted: true } }).then(
        (response) =>
          response.data?.filter((action) => action.status !== "draft") ?? [],
      ),
  });

export const filterActions = (
  actions: ActionDto[],
  mode: FilterMode,
): ActionDto[] => {
  switch (mode) {
    case FilterMode.All:
      return actions.filter((action) => action.status !== "planned");
    case FilterMode.PendingOfficeResolution:
      return actions.filter((action) => action.status === "office_action");
    case FilterMode.MemberAction:
      return actions.filter(
        (action) =>
          action.status === "member_action" && !action.everyoneShouldComplete,
      );
    case FilterMode.Past:
      return actions.filter(
        (action) => action.status === "completed" || action.status === "failed",
      );
    default:
      const x: never = mode;
      throw new Error(`Invalid filter mode: ${x}`);
  }
};
