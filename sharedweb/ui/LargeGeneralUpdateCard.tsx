import { useMemo } from "react";
import type { GeneralUpdateDto } from "@alliance/shared/client";
import type { DisplayBlock } from "@alliance/shared/forms/display-blocks";
import type { FormSchema } from "@alliance/shared/forms/formschema";
import RenderDisplayBlock from "@alliance/sharedweb/forms/RenderDisplayBlock";
import Card from "@alliance/sharedweb/ui/Card";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";

export interface LargeGeneralUpdateCardProps {
  title: string;
  schema: Record<string, unknown>;
  onDismiss?: () => void;
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
    <Card className="p-6 sm:p-8 w-full relative border-[1.5px] rounded">
      <div className="gap-y-4 flex flex-col">
        <div className="flex flex-col">
          {onDismiss && <p>General update</p>}
          <p className="font-semibold text-2xl font-serif">{title}</p>
        </div>
        <div className="space-y-4">
          {displayBlocks.map((block, index) => (
            <RenderDisplayBlock key={block.id ?? index} block={block} />
          ))}
        </div>
        {onDismiss && (
          <Button
            color={ButtonColor.LightHover}
            onClick={onDismiss}
            className="w-full"
          >
            Dismiss
          </Button>
        )}
      </div>
    </Card>
  );
};

export default LargeGeneralUpdateCard;
