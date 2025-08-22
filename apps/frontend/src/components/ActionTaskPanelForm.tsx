import { Form, SubmitFormDto } from "@alliance/shared/client";
import FormRenderer from "@alliance/shared/forms/FormRenderer";
import Card, { CardStyle } from "./system/Card";

interface ActionTaskPanelActivityProps {
  actionTaskForm: Form;
  onCompleteAction: () => void;
}

const ActionTaskPanelForm = ({
  actionTaskForm,
  onCompleteAction,
}: ActionTaskPanelActivityProps) => {
  const handleSubmitForm = (data: SubmitFormDto) => {
    console.log(data);
    onCompleteAction();
  };
  return (
    <Card style={CardStyle.LightGrey}>
      <div className="flex flex-col gap-y-2">
        <p className="text-zinc-500 text-sm mb-1">
          This action is awaiting your completion.
        </p>
        <hr className="border-zinc-200" />
        <div>
          <FormRenderer
            form={actionTaskForm.schema}
            onSubmit={handleSubmitForm}
          />
        </div>
      </div>
    </Card>
  );
};

export default ActionTaskPanelForm;
