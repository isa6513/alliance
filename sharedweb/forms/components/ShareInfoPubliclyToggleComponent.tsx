import { useEffect, useRef } from "react";
import type { CustomComponentProps } from "./types";
import Card from "../../ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import YesNoToggle from "../../ui/YesNoToggle";

const DEFAULT_LABEL = "Share information publicly";
const DEFAULT_DESCRIPTION =
  "Allow your name, profile photo, and bio to be listed in a public member directory.";

const parseBooleanValue = (value: string | null): boolean | null => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return null;
};

const ShareInfoPubliclyToggleComponent = ({
  field,
  value,
  onChange,
  user,
  disabled,
}: CustomComponentProps) => {
  const parsedValue = parseBooleanValue(value);
  const userDefault =
    typeof user?.shareInfoPublicly === "boolean"
      ? user.shareInfoPublicly
      : null;
  const fallbackDefault = false;
  const lastSetByDefaultRef = useRef(false);

  const setValueFromDefault = (next: boolean) => {
    if (parsedValue === next) {
      return;
    }
    lastSetByDefaultRef.current = true;
    onChange(next ? "true" : "false");
  };

  useEffect(() => {
    if (userDefault !== null) {
      if (parsedValue === null) {
        setValueFromDefault(userDefault);
        return;
      }
      if (lastSetByDefaultRef.current && parsedValue !== userDefault) {
        setValueFromDefault(userDefault);
      }
      return;
    }
    if (parsedValue === null) {
      setValueFromDefault(fallbackDefault);
    }
  }, [parsedValue, userDefault, fallbackDefault]);

  const label =
    typeof field.label === "string" && field.label.trim().length > 0
      ? field.label
      : DEFAULT_LABEL;
  const description =
    typeof field.description === "string" && field.description.trim().length > 0
      ? field.description
      : DEFAULT_DESCRIPTION;
  const resolvedValue = parsedValue ?? userDefault ?? fallbackDefault;
  const isDisabled = Boolean(disabled || user?.anonymous);

  return (
    <Card
      style={CardStyle.White}
      className="flex flex-row gap-x-4 items-center justify-between"
    >
      <div>
        <label className="block font-medium mb-1">
          Share information publicly
          {field.required && (
            <span className="text-red-500 text-sm ml-1">*</span>
          )}
        </label>
        <p className="text-zinc-500">{description}</p>
      </div>
      <YesNoToggle
        value={resolvedValue}
        onChange={(next) => {
          lastSetByDefaultRef.current = false;
          onChange(next ? "true" : "false");
        }}
        disabled={isDisabled}
        ariaLabel={label}
      />
    </Card>
  );
};

export default ShareInfoPubliclyToggleComponent;
