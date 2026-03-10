import { ActionDto } from "@alliance/shared/client";
import FormRenderer from "@alliance/sharedweb/forms/FormRenderer";
import { FormSchema } from "@alliance/shared/forms/formschema";
import Card from "@alliance/sharedweb/ui/Card";
import CheckIcon from "@alliance/sharedweb/ui/icons/CheckIcon";
import { CardStyle } from "@alliance/shared/styles/card";
import { useCompletedTaskForm } from "@alliance/shared/lib/actionTaskPanelCompleted";

export interface ActionTaskPanelCompletedProps {
  action: ActionDto | null;
}

const ActionTaskPanelCompleted = ({
  action,
}: ActionTaskPanelCompletedProps) => {
  const formResponse = useCompletedTaskForm(action);

  const completedCard = (
    <Card style={CardStyle.White} className="mb-2">
      <div className="flex items-center gap-x-3">
        <CheckIcon size="small" />
        <p>You&apos;ve completed this task.</p>
      </div>
    </Card>
  );

  if (action?.taskFormId && formResponse) {
    return (
      <>
        {completedCard}
        <Card
          style={CardStyle.Grey}
          className="inline-block !p-3 md:!p-6 space-y-4 -mt-3 rounded-t-none"
        >
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
        </Card>
      </>
    );
  } else {
    return completedCard;
  }
};

export default ActionTaskPanelCompleted;
