import { ActionDto } from "@alliance/shared/client";
import { useCompletedTaskForm } from "@alliance/shared/lib/actionTaskPanelCompleted";
import { cn } from "@alliance/shared/styles/util";
import { FormSchema } from "@alliance/shared/forms/formschema";
import { View } from "react-native";
import { taskHeaders } from "@alliance/shared/lib/copy";
import FormRenderer from "./forms/FormRenderer";
import Card, { CardStyle } from "./system/Card";
import CheckIcon from "./system/CheckIcon";
import Text from "./system/Text";

const noop = () => {};

export enum ActionTaskPanelResolvedType {
  Completed = "completed",
  Withdrawn = "withdrawn",
}

const resolvedPanelConfig = {
  [ActionTaskPanelResolvedType.Completed]: {
    taskPanelTop: (
      <View className="flex-row items-center gap-x-3">
        <CheckIcon size="small" />
        <Text className="text-zinc-900">
          {taskHeaders.actionPage.completed}
        </Text>
      </View>
    ),
    topCardStyle: CardStyle.White,
    topCardClassName: "border border-zinc-200",
    taskPanelStyle: CardStyle.Grey,
    taskPanelClassName: "border border-zinc-200 border-t-0 bg-zinc-100",
  },
  [ActionTaskPanelResolvedType.Withdrawn]: {
    taskPanelTop: <Text>{taskHeaders.actionPage.withdrew}</Text>,
    topCardStyle: CardStyle.Grey,
    topCardClassName: "border border-zinc-200",
    taskPanelStyle: CardStyle.White,
    taskPanelClassName: "border border-zinc-200 border-t-0",
  },
} as const;

interface ActionTaskPanelResolvedProps {
  action: ActionDto | null;
  type: ActionTaskPanelResolvedType;
}

export default function ActionTaskPanelResolved({
  action,
  type,
}: ActionTaskPanelResolvedProps) {
  const formResponse = useCompletedTaskForm(action);
  const hasCompletedForm = Boolean(action?.taskFormId && formResponse);
  const {
    taskPanelTop,
    topCardStyle,
    topCardClassName,
    taskPanelStyle,
    taskPanelClassName,
  } = resolvedPanelConfig[type];

  const topCard = (
    <Card
      cardStyle={topCardStyle}
      className={cn(topCardClassName, hasCompletedForm && "rounded-b-none")}
    >
      {taskPanelTop}
    </Card>
  );

  if (!hasCompletedForm || !action || !formResponse) {
    return topCard;
  }

  return (
    <View>
      {topCard}
      <Card
        cardStyle={taskPanelStyle}
        className={cn("p-3 space-y-4 rounded-t-none", taskPanelClassName)}
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
          scrollPageTo={noop}
          scrollToEnd={noop}
        />
      </Card>
    </View>
  );
}
