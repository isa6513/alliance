import {
  ActionDto,
  FormDto,
  FormResponseDto,
  tasksGetForm,
  tasksGetMyFormResponse,
} from "@alliance/shared/client";
import FormRenderer from "@alliance/shared/forms/FormRenderer";
import { FormSchema } from "@alliance/shared/forms/formschema";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import { useEffect, useState } from "react";

export interface ActionTaskPanelCompletedProps {
  action: ActionDto;
}

const ActionTaskPanelCompleted = ({
  action,
}: ActionTaskPanelCompletedProps) => {
  const [formResponse, setFormResponse] = useState<FormResponseDto | null>(
    null
  );
  const [form, setForm] = useState<FormDto | null>(null);

  useEffect(() => {
    if (action.taskFormId) {
      const fetchFormAndResponse = async (id: number) => {
        const formResponse = await tasksGetMyFormResponse({
          path: { id },
        });
        if (formResponse.data) {
          setFormResponse(formResponse.data);
        }
        const form = await tasksGetForm({
          path: { id },
        });
        if (form.data) {
          setForm(form.data);
        }
      };
      fetchFormAndResponse(action.taskFormId);
    }
  }, [action.taskFormId]);

  console.log("form", form);
  console.log("formResponse", formResponse);

  return (
    <div className="flex flex-col gap-y-5">
      <Card style={CardStyle.Green}>
        <p className="">
          You&apos;ve completed this action! Thank you for your help.
        </p>
      </Card>
      {action.taskFormId && formResponse && form && (
        <Card style={CardStyle.Grey} className="inline-block">
          <FormRenderer
            form={form?.schema as unknown as FormSchema<string, string>}
            completedFormResponse={formResponse}
            renderFormAsCompleted
            onSubmit={() => {}}
          />
        </Card>
      )}
    </div>
  );
};

export default ActionTaskPanelCompleted;
