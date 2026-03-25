import { ActionDto } from "@alliance/shared/client";
import FormRenderer from "@alliance/sharedweb/forms/FormRenderer";
import Card from "@alliance/sharedweb/ui/Card";
import { FormSchema } from "@alliance/shared/forms/formschema";
import { CardStyle } from "@alliance/shared/styles/card";
import { useCompletedTaskForm } from "@alliance/shared/lib/actionTaskPanelCompleted";
import { taskWithdrew } from "@alliance/shared/lib/copy";
import ActionPageTaskPanelCardWrapper from "./ActionPageTaskPanelCardWrapper";

export interface ActionTaskPanelDeclinedProps {
  action: ActionDto | null;
}

const ActionTaskPanelDeclined = ({
  action,
}: ActionTaskPanelDeclinedProps) => {
  const formResponse = useCompletedTaskForm(action);

  const withdrawnCard = <p>{taskWithdrew}</p>;

  if (action?.taskFormId && formResponse) {
    return (
      <ActionPageTaskPanelCardWrapper
        taskPanelTop={withdrawnCard}
        taskPanelTopStyle={CardStyle.WhiteBorder}
        taskPanel={
          <FormRenderer
            form={formResponse.schemaSnapshot as unknown as FormSchema}
            id={formResponse.formId}
            actionId={action.id}
            completedFormResponse={formResponse}
            renderFormAsCompleted
            onSubmit={null}
            userId={formResponse.user?.id}
            user={formResponse.user ?? undefined}
          />
        }
        taskPanelStyle={CardStyle.LightGreyBorder}
      />
    );
  }

  return <Card style={CardStyle.WhiteBorder}>{withdrawnCard}</Card>;
};

export default ActionTaskPanelDeclined;
