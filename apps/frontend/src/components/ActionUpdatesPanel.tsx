import { ActionUpdate } from "@alliance/shared/client/types.gen";
import ActionUpdateCard from "@alliance/shared/ui/ActionUpdateCard";
import { useState } from "react";

const ActionUpdatesPanel = ({ updates }: { updates: ActionUpdate[] }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleUpdates = expanded ? updates : updates.slice(0, 1);
  return (
    <div className="flex flex-col gap-y-2 items-start">
      {visibleUpdates.map((update) => (
        <ActionUpdateCard key={update.id} update={update} />
      ))}
      {updates.length > 1 && (
        <div className="flex flex-row gap-x-2 items-center justify-end w-full">
          <button
            className="text-blue-500"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide old updates" : "Show all updates"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionUpdatesPanel;
