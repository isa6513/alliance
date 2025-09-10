import { FilterMode } from "@alliance/shared/lib/actionUtils";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { useMemo, useState } from "react";
import { ActionWithRelation, useAppLoaderData } from "../../applayout";
import ActionItemCard from "../../components/ActionItemCard";
import { useActionCounts } from "../../lib/useActionWebSocket";

export const filterActions = (
  actions: ActionWithRelation[],
  mode: FilterMode
): ActionWithRelation[] => {
  switch (mode) {
    case FilterMode.All:
      return actions;
    case FilterMode.GatheringCommitments:
      return actions.filter(
        (action) => action.status === "gathering_commitments"
      );
    case FilterMode.PendingOfficeAction:
      return actions.filter(
        (action) => action.status === "commitments_reached"
      );
    case FilterMode.MemberAction:
      return actions.filter((action) => action.status === "member_action");
    case FilterMode.PendingOfficeResolution:
      return actions.filter((action) => action.status === "resolution");
    case FilterMode.Past:
      return actions.filter(
        (action) => action.status === "completed" || action.status === "failed"
      );
    default:
      const x: never = mode;
      throw new Error(`Invalid filter mode: ${x}`);
  }
};

const ActionsListPage = () => {
  const { actions } = useAppLoaderData();
  const [filterMode, setFilterMode] = useState<FilterMode>(FilterMode.All);

  const actionIds = useMemo(() => actions.map((a) => a.id), [actions]);
  const liveCounts = useActionCounts(actionIds);

  const filteredActions = useMemo(
    () => filterActions(actions, filterMode),
    [actions, filterMode]
  );

  return (
    <div className="flex flex-col bg-white items-center">
      <div className="px-4 py-16 md:py-12 flex flex-col items-center w-[calc(min(650px,100%))] gap-y-6">
        <div className="flex flex-row justify-center items-center w-full gap-x-4">
          <div className="flex flex-row gap-2 items-center flex-wrap ">
            {Object.values(FilterMode).map((mode) => (
              <Button
                key={mode}
                color={
                  filterMode === mode ? ButtonColor.Black : ButtonColor.White
                }
                onClick={() => setFilterMode(mode)}
                className="text-nowrap"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-y-2 w-full">
          {filteredActions.map((action) => (
            <ActionItemCard
              key={action.id}
              {...action}
              className="w-full"
              // joinedCount={liveCounts[action.id] ?? action.usersJoined}
              // neededCount={
              //   action.status === "member_action"
              //     ? action.usersCompleted
              //     : undefined
              // }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionsListPage;
