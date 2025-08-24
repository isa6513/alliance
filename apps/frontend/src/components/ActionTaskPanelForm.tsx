import {
  FormDto,
  SubmitFormDto,
  tasksGetForm,
  tasksSubmitForm,
} from "@alliance/shared/client";
import FormRenderer from "@alliance/shared/forms/FormRenderer";
import { useEffect, useState } from "react";
import AppMarkdownWrapper from "./AppMarkdownWrapper";
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
    <Card style={CardStyle.White}>
      <div className="flex flex-col gap-y-2">
        <p className="font-medium text-lg mb-1">
          Complete this action by following these steps
        </p>
        <div>
          {form && (
            <FormRenderer
              form={form.schema}
              onSubmit={handleSubmitForm}
              markdownRenderer={(text) => (
                <AppMarkdownWrapper markdownContent={text} />
              )}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default ActionTaskPanelForm;
