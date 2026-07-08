import type { FormSchema } from "@alliance/common/forms/form-schema";

/**
 * Static task form schema for public previews of the member task UI. This uses
 * the same schema shape produced by the admin form builder, but does not depend
 * on a saved backend form record.
 */
export const exampleMemberTaskFormSchema = {
  title: "Example member task form",
  description: "",
  pages: [
    {
      id: "page-1",
      title: "Page 1",
      fields: [
        {
          id: "block-overview",
          type: "display",
          kind: "text",
          text: "Visit one cafe you already go to and ask whether they would consider switching to compostable cups using the Alliance supplier discount.",
        },
        {
          id: "block-script-label",
          type: "display",
          kind: "label",
          text: "Suggested script",
        },
        {
          id: "block-script",
          type: "display",
          kind: "copytext",
          title: "Copy or adapt this message",
          text: "Hi! I am part of a local group asking cafes to switch to compostable cups. We have access to a supplier discount that may lower your costs. Is there someone I could send the details to?",
        },
        {
          id: "field-contacted-cafe",
          type: "input",
          kind: "checkbox",
          label: "I asked a cafe about switching to compostable cups.",
          required: true,
        },
        {
          id: "field-cafe-name",
          type: "input",
          kind: "text",
          label: "Cafe name",
          placeholder: "Neighborhood Cafe",
          required: true,
        },
        {
          id: "field-response",
          type: "input",
          kind: "radio",
          label: "How did they respond?",
          required: true,
          options: [
            { label: "Interested", value: "interested" },
            { label: "Maybe later", value: "maybe-later" },
            { label: "Not interested", value: "not-interested" },
          ],
        },
        {
          id: "field-notes",
          type: "input",
          kind: "textarea",
          label: "Anything useful for the office to know?",
          placeholder: "Who you spoke with, follow-up details, or concerns they raised.",
          rows: 3,
        },
      ],
    },
  ],
  submit: { label: "Complete" },
  outputViews: [],
  aggregateViews: [],
} satisfies FormSchema;
