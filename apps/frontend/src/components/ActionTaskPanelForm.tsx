import {
  FormDto,
  SubmitFormDto,
  tasksGetForm,
  tasksSubmitForm,
} from "@alliance/shared/client";
import FormRenderer from "@alliance/shared/forms/FormRenderer";
import { useEffect, useState } from "react";
import Card, { CardStyle } from "./system/Card";

interface ActionTaskPanelActivityProps {
  taskFormId: number;
  onCompleteAction: () => void;
}

const ActionTaskPanelForm = ({
  taskFormId,
  onCompleteAction,
}: ActionTaskPanelActivityProps) => {
  const [form, setForm] = useState<FormDto | null>(null);
  useEffect(() => {
    const fetchForm = async () => {
      const form = await tasksGetForm({
        path: { id: taskFormId },
      });
      if (!form.data) {
        throw new Error("Form not found");
      }
      setForm(form.data);
    };
    fetchForm();
  }, [taskFormId]);

  const handleSubmitForm = async (data: SubmitFormDto) => {
    const response = await tasksSubmitForm({
      path: { id: taskFormId },
      body: data,
    });
    if (response.response.ok) {
      onCompleteAction();
    }
  };
  return (
    <Card style={CardStyle.LightGrey}>
      <div className="flex flex-col gap-y-2">
        <p className="text-zinc-500 text-sm mb-1">
          This action is awaiting your completion.
        </p>
        <hr className="border-zinc-200" />
        <div>
          {form && (
            <FormRenderer form={form.schema} onSubmit={handleSubmitForm} />
          )}
        </div>
      </div>
    </Card>
  );
};

export default ActionTaskPanelForm;
