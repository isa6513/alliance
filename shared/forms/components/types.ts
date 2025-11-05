import type { ComponentType } from "react";
import type { UserDto } from "@alliance/shared/client";
import type { CustomComponentField } from "../formschema";

export interface CustomComponentProps {
  field: CustomComponentField;
  value: string | null;
  onChange: (value: string) => void;
  user?: Omit<UserDto, "email">;
  disabled?: boolean;
}

export interface CustomComponentDefinition {
  id: string;
  label: string;
  description?: string;
  component: ComponentType<CustomComponentProps>;
  defaultValue?: string;
}
