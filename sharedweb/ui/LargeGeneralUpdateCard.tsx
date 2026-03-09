import type { FormSchema } from "@alliance/shared/forms/formschema";
import FormRenderer from "@alliance/sharedweb/forms/FormRenderer";
import Card from "@alliance/sharedweb/ui/Card";
import { UserDto } from "@alliance/shared/client";

export interface LargeGeneralUpdateCardProps {
  title: string;
  schema: Record<string, unknown>;
  onDismiss?: () => void;
  id?: number;
  userId?: number | string;
  user?: UserDto;
}

function getFormSchema(schema: Record<string, unknown>): FormSchema | null {
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

const LargeGeneralUpdateCard: React.FC<LargeGeneralUpdateCardProps> = ({
  title,
  schema,
  onDismiss,
  id: propsId,
  userId,
  user,
}) => {
  const formSchema = getFormSchema(schema);

  return (
    <Card className="p-6 sm:p-8 w-full relative border-[1.5px] rounded">
      <div className="gap-y-4 flex flex-col">
        <div className="flex flex-col">
          {onDismiss && <p>General update</p>}
          <p className="text-title-small">{title}</p>
        </div>
        <div className="space-y-4">
          {formSchema ? (
            <FormRenderer
              form={formSchema}
              id={propsId ?? 0}
              actionId={0}
              onSubmit={null}
              userId={userId}
              user={user}
              isGeneralUpdate
              onDismiss={onDismiss}
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
};

export default LargeGeneralUpdateCard;
