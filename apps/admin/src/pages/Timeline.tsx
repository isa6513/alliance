import { actionsFindAllWithDrafts } from "@alliance/shared/client";
import React, { useCallback, useEffect, useState } from "react";
import ActionTimeline from "../components/ActionTimeline";
import { Action } from "@alliance/shared/client/types.gen";

const Timeline: React.FC = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [actionsLoading, setActionsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadActions = useCallback(async () => {
    try {
      const response = await actionsFindAllWithDrafts();
      if (response.data) {
        setActions(response.data);
      }
      setActionsLoading(false);
    } catch (err) {
      setError("Failed to load actions");
      setActionsLoading(false);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  if (actionsLoading) {
    return <p>Loading actions...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="flex-1 overflow-hidden h-full">
      <ActionTimeline actions={actions} className="h-full" />
    </div>
  );
};

export default Timeline;
