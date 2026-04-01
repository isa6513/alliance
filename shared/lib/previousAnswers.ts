import type { PreviousAnswerBlock } from "@alliance/common/forms/display-blocks";
import type {
  AnyField,
  FormSchema,
  FormValue,
  ListField,
} from "@alliance/common/forms/form-schema";

export function findFieldInSchema(
  schema: FormSchema,
  fieldId: string,
): AnyField | undefined {
  for (const page of schema.pages) {
    for (const element of page.fields) {
      if ("label" in element) {
        const field = element as AnyField;
        if (field.id === fieldId) {
          return field;
        }
      }
    }
  }

  return undefined;
}

export function isPreviousAnswerValueEmpty(value: FormValue | undefined) {
  return value === undefined || value === null || value === "";
}

export function getVisiblePreviousAnswerSubFields(
  field: ListField,
  block: PreviousAnswerBlock,
) {
  if (!block.visibleSubFieldIds?.length) {
    return field.fields;
  }

  const visibleSubFieldIds = new Set(block.visibleSubFieldIds);
  return field.fields.filter((subField) => visibleSubFieldIds.has(subField.id));
}
