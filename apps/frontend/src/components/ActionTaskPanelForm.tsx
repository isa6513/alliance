import {
  FormDto,
  SubmitFormDto,
  tasksGetForm,
  tasksSubmitForm,
} from "@alliance/shared/client";
import { useEffect, useState } from "react";
import AppMarkdownWrapper from "./AppMarkdownWrapper";
import Card, { CardStyle } from "./system/Card";
import TempFormRenderer from "./TempFormRenderer";

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
        <p className="font-medium text-lg mb-1">Steps</p>
        <div>
          {form && (
            <TempFormRenderer
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
