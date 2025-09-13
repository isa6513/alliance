type RequiredToggleProps = {
  checked: boolean | undefined;
  onChange: (checked: boolean) => void;
  className?: string;
  label?: string;
};

export function RequiredToggle({
  checked,
  onChange,
  className = "",
  label = "Required",
}: RequiredToggleProps) {
  return (
    <label className={`flex items-center text-xs text-gray-700 ${className}`}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mr-1"
      />
      {label}
    </label>
  );
}

type RequiredAsteriskProps = {
  required?: boolean;
  className?: string;
};

export function RequiredAsterisk({
  required,
  className = "text-red-500 ml-1",
}: RequiredAsteriskProps) {
  if (!required) return null;
  return <span className={className}>*</span>;
}

// ---------------- Conditional Visibility ----------------
import type {
  AnyField,
  CheckboxField,
  Condition,
  MultiSelectField,
  RadioField,
  SelectField,
} from "@alliance/shared/forms/formschema";

type ConditionalVisibilityProps = {
  field: AnyField;
  previousFields: AnyField[];
  // Only updates the "visibleIf" property for a field
  onChange: (updates: { visibleIf?: Condition }) => void;
};

type ControllerField =
  | CheckboxField
  | RadioField
  | SelectField
  | MultiSelectField;

function isConditionalController(f: AnyField): f is ControllerField {
  return (
    f.kind === "checkbox" ||
    f.kind === "radio" ||
    f.kind === "select" ||
    f.kind === "multiselect"
  );
}

export function ConditionalVisibility({
  field,
  previousFields,
  onChange,
}: ConditionalVisibilityProps) {
  const controllers = (previousFields || []).filter(
    (f): f is ControllerField => isConditionalController(f)
  );

  type SimpleCondition = Exclude<Condition, { expr: string }>;

  const cond = field.visibleIf;
  const enabled = !!cond && "when" in cond;
  const selectedControllerId: string | undefined =
    cond && "when" in cond ? cond.when : undefined;
  const selectedController = controllers.find(
    (f) => f.id === selectedControllerId
  );
  const equalsValue: SimpleCondition["equals"] | undefined =
    cond && "when" in cond ? cond.equals : undefined;

  const handleEnableToggle = (checked: boolean) => {
    if (!checked) {
      onChange({ visibleIf: undefined });
      return;
    }
    // Enable with first available controller (if any)
    const first = controllers[0];
    if (!first) return;
    let defaultEquals: SimpleCondition["equals"];
    if (first.kind === "checkbox") {
      defaultEquals = true;
    } else {
      defaultEquals = first.options?.[0]?.value ?? "";
    }
    onChange({
      visibleIf: {
        when: first.id,
        equals: defaultEquals,
      },
    });
  };

  const handleControllerChange = (id: string) => {
    const next = controllers.find((f) => f.id === id);
    if (!next) return;
    let nextEquals: SimpleCondition["equals"];
    if (next.kind === "checkbox") {
      nextEquals = true;
    } else {
      nextEquals = next.options?.[0]?.value ?? "";
    }
    onChange({
      visibleIf: { when: next.id, equals: nextEquals },
    });
  };

  const handleEqualsChange = (val: string) => {
    if (!selectedController) return;
    const equals: SimpleCondition["equals"] =
      selectedController.kind === "checkbox" ? val === "true" : val;
    onChange({
      visibleIf: {
        when: selectedController.id,
        equals,
      },
    });
  };

  return (
    <div className="mt-2 border-t border-gray-200 pt-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700">
          Conditional visibility
        </label>
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={enabled}
          onChange={(e) => handleEnableToggle(e.target.checked)}
          disabled={controllers.length === 0}
          title={
            controllers.length === 0
              ? "Add a checkbox/select/radio before this field to enable"
              : undefined
          }
        />
      </div>

      {enabled && selectedController && (
        <div className="mt-2 space-y-2">
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              Show when field
            </label>
            <select
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedControllerId || ""}
              onChange={(e) => handleControllerChange(e.target.value)}
            >
              {controllers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1">equals</label>
            {selectedController.kind === "checkbox" ? (
              <select
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={String(!!equalsValue)}
                onChange={(e) => handleEqualsChange(e.target.value)}
              >
                <option value="true">Checked</option>
                <option value="false">Unchecked</option>
              </select>
            ) : (
              <select
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={String(equalsValue ?? "")}
                onChange={(e) => handleEqualsChange(e.target.value)}
              >
                {selectedController.options?.map((opt, idx) => (
                  <option key={idx} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}
      {controllers.length === 0 && (
        <p className="mt-1 text-[11px] text-gray-400">
          No earlier checkbox/select/radio fields available to reference.
        </p>
      )}
    </div>
  );
}
