import { useMemo } from "react";
import type { GeneralUpdateDto } from "@alliance/shared/client";
import type { DisplayBlock } from "@alliance/shared/forms/display-blocks";
import type { FormSchema } from "@alliance/shared/forms/formschema";
import RenderDisplayBlock from "@alliance/sharedweb/forms/RenderDisplayBlock";
import Card from "@alliance/sharedweb/ui/Card";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import { CardStyle } from "@alliance/shared/styles/card";

export interface LargeGeneralUpdateCardProps {
  title: string;
  schema: Record<string, unknown>;
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

const LargeGeneralUpdateCard: React.FC<LargeGeneralUpdateCardProps> = ({
  title,
  schema,
  onDismiss,
}) => {
  const displayBlocks = useMemo(
    () => getDisplayBlocksFromSchema(schema),
    [schema]
  );

  return (
    <Card className="p-4 sm:p-6 w-full relative border-dashed border-[1.5px] !border-blue-300 rounded">
      <Card style={CardStyle.Alert} className="mb-3 border-none rounded-md">
        <p className="font-semibold">General update</p>
        <p className="mb-0 text-zinc-700">
          This is an update for you to read. No action required.
        </p>
      </Card>
      <div className="p-0 sm:p-2">
        <div className="flex flex-row gap-4 items-start mb-4">
          <div className="flex flex-col flex-1 gap-y-2">
            <p className="font-semibold text-2xl font-serif">{title}</p>
          </div>
        </div>
        <div className="space-y-4 mb-8">
          {displayBlocks.map((block, index) => (
            <RenderDisplayBlock key={block.id ?? index} block={block} />
          ))}
        </div>
        <div className="border-t border-zinc-200 pt-6">
          <Button
            color={ButtonColor.LightHover}
            onClick={onDismiss}
            className="w-full gap-x-1"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LargeGeneralUpdateCard;
