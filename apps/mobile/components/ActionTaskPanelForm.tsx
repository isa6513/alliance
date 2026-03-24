import {
  SubmitFormDto,
  tasksGetForm,
  tasksSubmitForm,
  tasksSubmitPublicForm,
} from "@alliance/shared/client";
import { useState } from "react";
import FormRenderer from "./forms/FormRenderer";
import { FormSchema } from "@alliance/shared/forms/formschema";
import { ActivityIndicator, View } from "react-native";
import { usePostHog } from "posthog-react-native";
import Text from "./system/Text";
import { useQuery } from "@tanstack/react-query";

interface ActionTaskPanelFormProps {
  taskFormId: number;
  onCompleteAction: ((sendComplete: boolean) => void) | null;
  onFormStarted: () => void;
  onAbandonAction: (
    outOfTime: boolean,
    reason: string,
    partialFormData: SubmitFormDto,
  ) => void;
  actionId: number;
  publicAction?: boolean;
  scrollPageTo: (y: number, animated?: boolean) => void;
  scrollToEnd: (animated?: boolean) => void;
  onSubmitSuccess: () => void;
}

const ActionTaskPanelForm = ({
  taskFormId,
  onCompleteAction,
  onFormStarted,
  onAbandonAction,
  actionId,
  publicAction = false,
  scrollPageTo,
  scrollToEnd,
  onSubmitSuccess,
}: ActionTaskPanelFormProps) => {
  const posthog = usePostHog();
  const [error, setError] = useState<string | null>(null);

  const {
    data: form,
    error: formError,
    isPending,
  } = useQuery({
    queryKey: ["form", taskFormId],
    queryFn: () =>
      tasksGetForm({ path: { id: taskFormId } }).then(
        (response) => response.data,
      ),
  });

  const handleSubmitForm = onCompleteAction
    ? async (data: SubmitFormDto) => {
        setError(null);

        const response = publicAction
          ? await tasksSubmitPublicForm({
              path: { id: taskFormId },
              body: data,
            })
          : await tasksSubmitForm({
              path: { id: taskFormId },
              body: data,
            });
        if (response.response.ok) {
          onSubmitSuccess();
        } else {
          console.error(response.error);
          posthog.captureException(response.error, {
            event: "form_submit_error",
            properties: {
              actionId: actionId,
              $exception_fingerprint: "FormSubmitError",
            },
          });
          setError("Failed to submit action.");
        }
      }
    : null;

  if (isPending) {
    return <ActivityIndicator />;
  }

  if (!form) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{formError?.message}</Text>
      </View>
    );
  }

  return (
    <View>
      <FormRenderer
        id={taskFormId}
        form={form?.schema as unknown as FormSchema}
        onSubmit={handleSubmitForm}
        onFormStarted={onFormStarted}
        onAbandonAction={onAbandonAction}
        actionId={actionId}
        persistKey={String(taskFormId)}
        scrollPageTo={scrollPageTo}
        scrollToEnd={scrollToEnd}
      />
      {error ? <Text className="text-red-500">{error}</Text> : null}
      {formError ? (
        <Text className="text-red-500">{formError.message}</Text>
      ) : null}
    </View>
  );
};

export default ActionTaskPanelForm;
