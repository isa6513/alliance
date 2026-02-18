import { useMemo } from "react";
import { View } from "react-native";
import type { GeneralUpdateDto } from "@alliance/shared/client";
import type { DisplayBlock } from "@alliance/shared/forms/display-blocks";
import type { FormSchema } from "@alliance/shared/forms/formschema";
import { RenderDisplayBlockMobile } from "./forms/FormRenderer";
import Card from "./system/Card";
import Button, { ButtonColor } from "./system/Button";
import Text from "./system/Text";

export interface LargeGeneralUpdateCardProps {
  generalUpdate: GeneralUpdateDto;
  onDismiss: () => void;
}

function isDisplayBlock(element: unknown): element is DisplayBlock {
  return (
    typeof element === "object" &&
    element !== null &&
    "kind" in element &&
    typeof (element as DisplayBlock).kind === "string"
  );
}

function getDisplayBlocksFromSchema(
  schema: GeneralUpdateDto["schema"]
): DisplayBlock[] {
  if (
    typeof schema !== "object" ||
    schema === null ||
    !("pages" in schema) ||
    !Array.isArray((schema as { pages?: unknown[] }).pages)
  ) {
    return [];
  }
  const formSchema = schema as unknown as FormSchema;
  const blocks: DisplayBlock[] = [];
  for (const page of formSchema.pages ?? []) {
    for (const element of page.fields ?? []) {
      if (isDisplayBlock(element)) {
        blocks.push(element);
      }
    }
  }
  return blocks;
}

export default function LargeGeneralUpdateCard({
  generalUpdate,
  onDismiss,
}: LargeGeneralUpdateCardProps) {
  const displayBlocks = useMemo(
    () => getDisplayBlocksFromSchema(generalUpdate.schema),
    [generalUpdate.schema]
  );

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
        {displayBlocks.map((block, index) => (
          <RenderDisplayBlockMobile key={block.id ?? index} block={block} />
        ))}
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
