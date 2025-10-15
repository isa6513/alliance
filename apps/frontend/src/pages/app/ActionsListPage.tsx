import { FilterMode } from "@alliance/shared/lib/actionUtils";
import DropdownSelect from "@alliance/shared/ui/DropdownSelect";
import { useMemo, useState } from "react";
import { ActionWithRelation, AppLayoutOutletContext } from "../../applayout";
import ActionItemCard from "../../components/ActionItemCard";
import { useGrayBackground } from "../../components/HtmlBackgroundManager";
import List from "@alliance/shared/ui/List";
import CenterLayout from "@alliance/shared/ui/CenterLayout";
import { useOutletContext } from "react-router";

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
    case FilterMode.OfficeAction:
      return actions.filter((action) => action.status === "office_action");
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
  const { actions } = useOutletContext<AppLayoutOutletContext>();

  const [filterMode, setFilterMode] = useState<FilterMode>(FilterMode.All);

  const modeToActions: Record<FilterMode, ActionWithRelation[]> =
    useMemo(() => {
      return Object.values(FilterMode).reduce((acc, mode) => {
        acc[mode] = filterActions(actions ?? [], mode);
        return acc;
      }, {} as Record<FilterMode, ActionWithRelation[]>);
    }, [actions]);

  useGrayBackground();

  const filteredActions = [...modeToActions[filterMode]].sort((a, b) => {
    const latestA =
      a.events.length > 0
        ? new Date(a.events[a.events.length - 1].date)
        : new Date(0);
    const latestB =
      b.events.length > 0
        ? new Date(b.events[b.events.length - 1].date)
        : new Date(0);
    return latestB.getTime() - latestA.getTime();
  });

  return (
    <CenterLayout className="gap-y-4" width="3xl">
      <div className="flex flex-row justify-start items-center w-full">
        <p className="mx-4">Filter by:</p>
        <DropdownSelect
          options={Object.values(FilterMode)}
          secondaryLabels={Object.values(FilterMode).map((mode) =>
            modeToActions[mode].length.toString()
          )}
          value={filterMode}
          onChange={(mode) => setFilterMode(mode as FilterMode)}
        />
      </div>

      <List className="w-full mb-20">
        {filteredActions.map((action) => (
          <ActionItemCard
            key={action.id}
            {...action}
            className="w-full hover:bg-zinc-100"
            joinedCount={action.usersJoined}
            completedCount={action.usersCompleted}
          />
        ))}
        {filteredActions.length === 0 && (
          <p className="text-center text-zinc-500 py-5">No matching actions</p>
        )}
      </List>
    </CenterLayout>
  );
};

export default ActionsListPage;
