import { useActionUpdates } from "@alliance/shared/lib/informationPage";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import ActionUpdateCard from "@alliance/sharedweb/ui/ActionUpdateCard";

const ActionUpdatesPage = () => {
  const { updates, error } = useActionUpdates();

  return (
    <CenterLayout>
      <div className="gap-y-4 flex flex-col">
        <h1 className="text-title">Action updates</h1>

        <div className="flex flex-col gap-y-4 text-base">
          {updates
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((update) => (
              <ActionUpdateCard
                key={update.id}
                update={update}
                onActionPageTimeline={false}
              />
            ))}
          {error && <p className="text-zinc-500">{error}</p>}
        </div>
      </div>
    </CenterLayout>
  );
};

export default ActionUpdatesPage;
