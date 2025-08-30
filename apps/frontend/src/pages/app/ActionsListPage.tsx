import { FilterMode, filterActions } from "@alliance/shared/lib/actionUtils";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { useMemo, useState } from "react";
import { useAppLoaderData } from "../../applayout";
import ActionItemCard from "../../components/ActionItemCard";
import { useActionCounts } from "../../lib/useActionWebSocket";

const ActionsListPage = () => {
  const { actions, relations } = useAppLoaderData();
  const [filterMode, setFilterMode] = useState<FilterMode>(FilterMode.All);

  const actionIds = useMemo(() => actions.map((a) => a.id), [actions]);
  const liveCounts = useActionCounts(actionIds);

  const filteredActions = useMemo(
    () => filterActions(actions, filterMode),
    [actions, filterMode]
  );

  return (
    <div className="flex flex-col bg-page items-center">
      <div className="px-4 py-16 md:py-12 flex flex-col items-center w-[calc(min(650px,100%))] gap-y-6">
        <div className="flex flex-row justify-center items-center w-full gap-x-4">
          <p className="text-lg text-left h-fit">Filter:</p>
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
              userRelation={relations?.get(action.id) ?? undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionsListPage;
