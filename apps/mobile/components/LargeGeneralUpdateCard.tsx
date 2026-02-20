import { View } from "react-native";
import type { GeneralUpdateDto, UserDto } from "@alliance/shared/client";
import type { FormSchema } from "@alliance/shared/forms/formschema";
import FormRenderer from "./forms/FormRenderer";
import Card from "./system/Card";
import Button, { ButtonColor } from "./system/Button";
import Text from "./system/Text";

export interface LargeGeneralUpdateCardProps {
  generalUpdate: GeneralUpdateDto;
  onDismiss: () => void;
  userId?: number | string;
  user?: UserDto;
}

function getFormSchema(schema: GeneralUpdateDto["schema"]): FormSchema | null {
  if (
    typeof schema !== "object" ||
    schema === null ||
    !("pages" in schema) ||
    !Array.isArray((schema as { pages?: unknown }).pages) ||
    (schema as { pages: unknown[] }).pages.length === 0
  ) {
    return null;
  }
  return schema as unknown as FormSchema;
}

export default function LargeGeneralUpdateCard({
  generalUpdate,
  onDismiss,
  userId,
  user,
}: LargeGeneralUpdateCardProps) {
  const formSchema = getFormSchema(generalUpdate.schema);

  return (
    <Card className="p-4 sm:p-6 w-full relative border-dashed border-[1.5px] border-blue-300 rounded">
      <View className="mb-3 p-3 rounded-md bg-blue-50 border border-blue-200">
        <Text className="font-semibold text-zinc-900">General update</Text>
        <Text className="text-zinc-700 mt-1">
          This is an update for you to read. No action required.
        </Text>
      </View>
      <View className="pb-2">
        <Text className="font-semibold text-2xl font-serif text-zinc-900">
          {generalUpdate.name}
        </Text>
      </View>
      <View className="gap-4 mb-8">
        {formSchema ? (
          <FormRenderer
            form={formSchema}
            id={generalUpdate.id}
            actionId={generalUpdate.id}
            onSubmit={null}
            userId={userId}
            user={user}
          />
        ) : null}
      </View>
      <View className="border-t border-zinc-200 pt-6">
        <Button
          color={ButtonColor.Light}
          onPress={onDismiss}
          className="w-full"
        >
          <Text>Dismiss</Text>
        </Button>
      </View>
    </Card>
  );
}
