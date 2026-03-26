import { useEffect, useState } from "react";
import { tasksGetMyFormResponse } from "../client/sdk.gen";
import { ActionDto, FormResponseDto } from "../client/types.gen";

export const useCompletedTaskForm = (
  action: Pick<ActionDto, "taskFormId"> | null,
  enabled = true,
) => {
  const [formResponse, setFormResponse] = useState<FormResponseDto | null>(
    null,
  );

  useEffect(() => {
    if (!enabled || !action?.taskFormId) {
      setFormResponse(null);
      return;
    }

    let cancelled = false;

    const fetchFormAndResponse = async (id: number) => {
      try {
        const response = await tasksGetMyFormResponse({
          path: { id },
        });
        if (!cancelled) {
          setFormResponse(response.data ?? null);
        }
      } catch {
        if (!cancelled) {
          setFormResponse(null);
        }
      }
    };

    void fetchFormAndResponse(action.taskFormId);

    return () => {
      cancelled = true;
    };
  }, [action, enabled]);

  return formResponse;
};
