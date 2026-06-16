import type { FormSchema } from "@alliance/common/forms/form-schema";
import type { GeneralUpdateDto, UserDto } from "@alliance/shared/client";
import { View } from "react-native";
import FormRenderer from "./forms/FormRenderer";
import Button, { ButtonColor } from "./system/Button";
import Card from "./system/Card";
import Text, { FontFamily, FontWeight } from "./system/Text";

export interface LargeGeneralUpdateCardProps {
  generalUpdate: GeneralUpdateDto;
  onDismiss: () => void;
  userId?: number | string;
  user?: UserDto;
  loadCurrentUserLocation?: boolean;
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
  loadCurrentUserLocation,
}: LargeGeneralUpdateCardProps) {
  const formSchema = getFormSchema(generalUpdate.schema);

  return (
    <Card className="p-4 sm:p-6 w-full relative rounded">
      <View className="pb-2">
        <Text
          className="text-2xl text-zinc-900"
          family={FontFamily.Serif}
          weight={FontWeight.Semibold}
        >
          {generalUpdate.name}
        </Text>
      </View>
      <View className="gap-4 mb-8">
        {formSchema ? (
          <FormRenderer
            form={formSchema}
            id={generalUpdate.id}
            formSnapshotId={null}
            actionId={generalUpdate.id}
            onSubmit={null}
            userId={userId}
            user={user}
            loadCurrentUserLocation={loadCurrentUserLocation}
            scrollPageTo={() => {}}
            scrollToEnd={() => {}}
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
