import { ActionDto } from "@alliance/shared/client";
import { Card, CardStyle, Text } from "./system";
import { useCompletedTaskForm } from "@alliance/shared/lib/actionTaskPanelCompleted";
import FormRenderer from "./forms/FormRenderer";
import { FormSchema } from "@alliance/shared/forms/formschema";
import { View } from "react-native";
import { taskCompleted } from "@alliance/shared/lib/copy";
import CheckIcon from "./system/CheckIcon";

export interface ActionTaskPanelCompletedProps {
  action: ActionDto | null;
}
const ActionTaskPanelCompleted = ({
  action,
}: ActionTaskPanelCompletedProps) => {
  const formResponse = useCompletedTaskForm(action);

  const completedCard = (
    <Card
      cardStyle={CardStyle.White}
      className="border rounded-b-none rounded-sm"
    >
      <View className="flex-row items-center gap-x-2">
        <CheckIcon size="small" />
        <Text>{taskCompleted}</Text>
      </View>
    </Card>
  );

  if (action?.taskFormId && formResponse) {
    return (
      <View>
        {completedCard}
        <Card
          cardStyle={CardStyle.Grey}
          className="p-3 space-y-4 border-none rounded-t-none"
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
      </View>
    );
  } else {
    return completedCard;
  }
};

export default ActionTaskPanelCompleted;
