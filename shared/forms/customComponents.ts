import type { ComponentType } from "react";
import type { UserDto } from "../client";
import type { CustomComponentField } from "@alliance/common/forms/form-schema";

export type CustomComponentConfigFieldType = "string" | "number" | "boolean";

export interface CustomComponentConfigField {
  name: string;
  label?: string;
  description?: string;
  type: CustomComponentConfigFieldType;
  defaultValue?: string | number | boolean;
}

export interface CustomComponentProps {
  field: CustomComponentField;
  value: string | null;
  onChange: (value: string) => void;
  user?: Omit<UserDto, "email">;
  disabled?: boolean;
  isOutputView?: boolean;
}

export interface CustomComponentDefinition {
  id: string;
  label: string;
  description?: string;
  component: ComponentType<CustomComponentProps>;
  defaultValue?: string;
  configFields?: CustomComponentConfigField[];
}
