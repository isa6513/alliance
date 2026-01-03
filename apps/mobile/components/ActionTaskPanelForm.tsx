import {
  FormDto,
  SubmitFormDto,
  tasksGetForm,
  tasksSubmitForm,
  tasksSubmitPublicForm,
} from "@alliance/shared/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import FormRenderer from "./forms/FormRenderer";
import { FormSchema } from "@alliance/shared/forms/formschema";
import { ActivityIndicator, View } from "react-native";
import { computeFormStorageKey } from "@alliance/shared/formrenderer";
import { useAuth } from "../lib/AuthContext";
import { usePostHog } from "posthog-react-native";
import SuccessOverlay from "./SuccessOverlay";
import { Text } from "./system";

interface ActionTaskPanelFormProps {
  taskFormId: number;
  onCompleteAction: ((sendComplete: boolean) => void) | null;
  onFormStarted: () => void;
  onAbandonAction: (
    outOfTime: boolean,
    reason: string,
    partialFormData: SubmitFormDto
  ) => void;
  actionId: number;
  publicAction?: boolean;
}

const ActionTaskPanelForm = ({
  taskFormId,
  onCompleteAction,
  onFormStarted,
  onAbandonAction,
  actionId,
  publicAction = false,
}: ActionTaskPanelFormProps) => {
  const [form, setForm] = useState<FormDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();

  const posthog = usePostHog();

  const handleSuccessComplete = useCallback(() => {
    setShowSuccess(false);
    if (onCompleteAction) {
      onCompleteAction(false);
    }
  }, [onCompleteAction]);

  useEffect(() => {
    const fetchForm = async () => {
      const form = await tasksGetForm({
        path: { id: taskFormId },
      });
      setForm(form.data ?? null);
    };
    fetchForm();
  }, [taskFormId]);

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
          if (publicAction) {
            window.location.href = "/actions/completed";
          }
          if (typeof window !== "undefined" && form) {
            const storageKey = computeFormStorageKey({
              formId: form.id,
              instanceId: taskFormId,
            });
            window.localStorage.removeItem(storageKey);
          }
          if (user && !user.hasActiveContract) {
            //TODO: better handling of user refresh (things used to break if the user signed a contract in another tab then went back to the first one)
            // refreshUser();
          }
          // Show success overlay - it will call onCompleteAction after animation
          setShowSuccess(true);
        } else {
          console.error(response.error);
          posthog.captureException(response.error, {
            event: "form_submit_error",
            properties: {
              actionId: actionId,
              $exception_fingerprint: "FormSubmitError",
            },
          });
          setError(
            "Failed to submit action. We have been notified of the problem and will take a look. You can also try again later."
          );
        }
      }
    : null;

  const { distinctId, sessionReplayUrl } = useMemo(() => {
    if (!posthog) return { distinctId: undefined, sessionReplayUrl: undefined };
    return {
      distinctId: posthog.getDistinctId(),
      sessionReplayUrl: undefined, //TODO mobile posthog doesnt have a replay url
    };
  }, [posthog]);

  if (!form) {
    return <ActivityIndicator />;
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
      />
      {error && <Text className="text-red-500">{error}</Text>}
      <SuccessOverlay
        visible={showSuccess}
        onComplete={handleSuccessComplete}
        message="Thank you!"
      />
    </View>
  );
};

export default ActionTaskPanelForm;
