import { FilterMode } from "@alliance/shared/lib/actionUtils";
import DropdownSelect from "@alliance/sharedweb/ui/DropdownSelect";
import { useMemo, useState } from "react";
import { ActionWithRelation, AppLayoutOutletContext } from "../../applayout";
import ActionItemCard from "../../components/ActionItemCard";
import { useGrayBackground } from "../../components/HtmlBackgroundManager";
import List from "@alliance/sharedweb/ui/List";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import { useOutletContext } from "react-router";
import Spinner from "../../components/Spinner";

export const filterActions = (
  actions: ActionWithRelation[],
  mode: FilterMode
): ActionWithRelation[] => {
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

const ActionsListPage = () => {
  const { actions, loading } = useOutletContext<AppLayoutOutletContext>();

  const [filterMode, setFilterMode] = useState<FilterMode>(FilterMode.All);

  const modeToActions: Record<FilterMode, ActionWithRelation[]> =
    useMemo(() => {
      return Object.values(FilterMode).reduce((acc, mode) => {
        acc[mode] = filterActions(actions ?? [], mode);
        return acc;
      }, {} as Record<FilterMode, ActionWithRelation[]>);
    }, [actions]);

  useGrayBackground();

  const filteredActions = useMemo(
    () => [...modeToActions[filterMode]],
    [modeToActions, filterMode]
  );

  return (
    <CenterLayout className="gap-y-4" width="4xl">
      <div className="flex flex-row justify-start items-center w-full gap-x-4">
        <p>Filter by:</p>
        <DropdownSelect
          options={FilterMode}
          secondaryLabel={(_, mode) => modeToActions[mode].length.toString()}
          value={filterMode}
          onChange={(_, mode) => setFilterMode(mode)}
        />
      </div>

      <List className="w-full">
        {filteredActions.map((action) => (
          <ActionItemCard key={action.id} action={action} className="w-full " />
        ))}
        {filteredActions.length === 0 && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-5">
                <Spinner size="large" />
              </div>
            ) : (
              <p className="text-center text-zinc-500 py-5">
                No matching actions
              </p>
            )}
          </>
        )}
      </List>
    </CenterLayout>
  );
};

export default ActionsListPage;
