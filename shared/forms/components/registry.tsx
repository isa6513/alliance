import type { CustomComponentDefinition } from "./types";
import ExampleContractComponent from "./ExampleContractComponent";

export const customComponentRegistry: CustomComponentDefinition[] = [
  {
    id: "example-contract",
    label: "Example Contract Component",
    description: "Example component showing use of user data",
    component: ExampleContractComponent,
  },
];

export const getCustomComponentById = (id: string | undefined | null) =>
  customComponentRegistry.find((component) => component.id === id);
