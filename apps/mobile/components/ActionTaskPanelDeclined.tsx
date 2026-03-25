import { ActionDto } from "@alliance/shared/client";
import { taskWithdrew } from "@alliance/shared/lib/copy";
import { useCompletedTaskForm } from "@alliance/shared/lib/actionTaskPanelCompleted";
import { FormSchema } from "@alliance/shared/forms/formschema";
import { View } from "react-native";
import Card, { CardStyle } from "./system/Card";
import Text from "./system/Text";
import FormRenderer from "./forms/FormRenderer";
import { cn } from "@alliance/shared/styles/util";

export interface ActionTaskPanelDeclinedProps {
  action: ActionDto | null;
}

export default function ActionTaskPanelDeclined({
  action,
}: ActionTaskPanelDeclinedProps) {
  const formResponse = useCompletedTaskForm(action);
  const hasWithdrawnForm = Boolean(action?.taskFormId && formResponse);

  const withdrawnCard = (
    <Card
      cardStyle={CardStyle.White}
      className={cn(
        "border border-zinc-200",
        hasWithdrawnForm && "rounded-b-none",
      )}
    >
      <Text>{taskWithdrew}</Text>
    </Card>
  );

  if (action?.taskFormId && formResponse) {
    return (
      <View>
        {withdrawnCard}
        <Card
          cardStyle={CardStyle.Grey}
          className="p-3 space-y-4 rounded-t-none border border-zinc-200 border-t-0 bg-zinc-100"
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
            scrollPageTo={() => {}}
            scrollToEnd={() => {}}
          />
        </Card>
      </View>
    );
  }

  return withdrawnCard;
}
