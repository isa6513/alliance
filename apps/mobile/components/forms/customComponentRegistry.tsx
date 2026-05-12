import type { CustomComponentDefinition } from "@alliance/shared/forms/customComponents";
import ExampleContractComponent from "./ExampleContractComponent";
import ShareInfoPubliclyToggleComponent from "./ShareInfoPubliclyToggleComponent";
import ShareUrlComponent from "./ShareUrlComponent";

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
    component: ShareUrlComponent,
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
  {
    id: "share-url",
    label: "Share External URL",
    description:
      "Component to share an admin-configured external URL with the user's share code appended.",
    component: ShareUrlComponent,
    configFields: [
      {
        name: "externalTargetId",
        label: "External Share Target ID",
        description:
          "ID of the admin-configured external share target. Manage targets in the admin panel.",
        type: "number",
      },
    ],
  },
  {
    id: "share-info-publicly-toggle",
    label: "Share Info Publicly Toggle",
    description: "Toggle a member's public profile visibility setting.",
    component: ShareInfoPubliclyToggleComponent,
  },
];

export const getCustomComponentById = (id: string | undefined | null) =>
  customComponentRegistry.find((component) => component.id === id);
