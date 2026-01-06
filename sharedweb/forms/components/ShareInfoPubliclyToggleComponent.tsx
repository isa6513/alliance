import { useEffect } from "react";
import type { CustomComponentProps } from "./types";
import Card from "../../ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import YesNoToggle from "../../ui/YesNoToggle";

const DEFAULT_LABEL = "Share information publicly";
const DEFAULT_DESCRIPTION =
  "Allow your name, photo, and user bio to be listed publicly in a member directory.";

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

  useEffect(() => {
    if (parsedValue === null && userDefault !== null) {
      onChange(userDefault ? "true" : "false");
    }
  }, [parsedValue, userDefault, onChange]);

  const label =
    typeof field.label === "string" && field.label.trim().length > 0
      ? field.label
      : DEFAULT_LABEL;
  const description =
    typeof field.description === "string" && field.description.trim().length > 0
      ? field.description
      : DEFAULT_DESCRIPTION;
  const resolvedValue = parsedValue ?? userDefault;
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
        onChange={(next) => onChange(next ? "true" : "false")}
        disabled={isDisabled}
        ariaLabel={label}
      />
    </Card>
  );
};

export default ShareInfoPubliclyToggleComponent;
