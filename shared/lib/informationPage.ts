import { useEffect, useState } from "react";
import { actionsAllUpdates, ActionUpdateDto } from "../client";

export function useActionUpdates() {
  const [updates, setUpdates] = useState<ActionUpdateDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    actionsAllUpdates().then((response) => {
      if (response.data) {
        setUpdates(response.data);
      } else {
        setError("Failed to load action updates");
      }
    });
  }, []);

  return { updates, error };
}
