import type { CustomComponentDefinition } from "./types";
import ExampleContractComponent from "./ExampleContractComponent";
import ActionShareUrlComponent from "./ActionShareUrlComponent";

export const customComponentRegistry: CustomComponentDefinition[] = [
  {
    id: "example-contract",
    label: "Example Contract Component",
    description: "Example component showing use of user data",
    component: ExampleContractComponent,
  },
  {
    id: "action-share-url",
    label: "Action Share URL Component",
    description: "Component to share the URL of an action",
    component: ActionShareUrlComponent,
    configFields: [
      {
        name: "actionId",
        label: "Action ID",
        description:
          "Specify which action to reference. Defaults to the current action when left blank.",
        type: "number",
      },
    ],
  },
];

export const getCustomComponentById = (id: string | undefined | null) =>
  customComponentRegistry.find((component) => component.id === id);
