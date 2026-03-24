import { ActionDto } from "@alliance/shared/client";
import Card, { CardStyle } from "./system/Card";
import Text from "./system/Text";
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
  const hasCompletedForm = Boolean(action?.taskFormId && formResponse);

  const completedCard = (
    <Card
      cardStyle={CardStyle.White}
      className={[
        "border border-zinc-200",
        hasCompletedForm ? "rounded-b-none" : "",
      ].join(" ")}
    >
      <View className="flex-row items-center gap-x-3">
        <CheckIcon size="small" />
        <Text className="text-zinc-900">{taskCompleted}</Text>
      </View>
    </Card>
  );

  if (action?.taskFormId && formResponse) {
    return (
      <View>
        {completedCard}
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
  } else {
    return completedCard;
  }
};

export default ActionTaskPanelCompleted;
