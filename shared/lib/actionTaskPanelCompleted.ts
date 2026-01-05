import { useEffect, useState } from "react";
import { tasksGetMyFormResponse } from "../client/sdk.gen";
import { ActionDto, FormResponseDto } from "../client/types.gen";

export const useCompletedTaskForm = (
  action: Pick<ActionDto, "taskFormId"> | null
) => {
  const [formResponse, setFormResponse] = useState<FormResponseDto | null>(
    null
  );

  useEffect(() => {
    if (action?.taskFormId) {
      const fetchFormAndResponse = async (id: number) => {
        const formResponse = await tasksGetMyFormResponse({
          path: { id },
        });
        if (formResponse.data) {
          setFormResponse(formResponse.data);
        }
      };
      fetchFormAndResponse(action.taskFormId);
    }
  }, [action]);

  return formResponse;
};
