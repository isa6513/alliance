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
import type { AnyField, Condition } from "@alliance/shared/forms/formschema";

type ConditionalVisibilityProps<TId extends string> = {
  field: AnyField<TId>;
  previousFields: AnyField<TId>[];
  // Only updates the "visibleIf" property for a field
  onChange: (updates: { visibleIf?: Condition<TId> }) => void;
};

const isConditionalController = (f: AnyField<string>) =>
  f.kind === "checkbox" ||
  f.kind === "radio" ||
  f.kind === "select" ||
  f.kind === "multiselect";

export function ConditionalVisibility<TId extends string>({
  field,
  previousFields,
  onChange,
}: ConditionalVisibilityProps<TId>) {
  const controllers = (previousFields || []).filter(isConditionalController);

  const enabled = !!field.visibleIf && "when" in (field.visibleIf || {});
  const selectedControllerId = (field.visibleIf as any)?.when as
    | string
    | undefined;
  const selectedController = controllers.find(
    (f) => f.id === selectedControllerId
  );
  const equalsValue = (field.visibleIf as any)?.equals as
    | string
    | number
    | boolean
    | null
    | undefined;

  const handleEnableToggle = (checked: boolean) => {
    if (!checked) {
      onChange({ visibleIf: undefined });
      return;
    }
    // Enable with first available controller (if any)
    const first = controllers[0];
    if (!first) return;
    let defaultEquals: any = true;
    if (first.kind === "checkbox") defaultEquals = true;
    else if ((first as any).options?.length)
      defaultEquals = (first as any).options[0].value;
    else defaultEquals = "";
    onChange({
      visibleIf: {
        when: first.id as TId,
        equals: defaultEquals,
      } as Condition<TId>,
    });
  };

  const handleControllerChange = (id: string) => {
    const next = controllers.find((f) => f.id === id);
    if (!next) return;
    let nextEquals: any = true;
    if (next.kind === "checkbox") nextEquals = true;
    else if ((next as any).options?.length)
      nextEquals = (next as any).options[0].value;
    else nextEquals = "";
    onChange({
      visibleIf: { when: id as TId, equals: nextEquals } as Condition<TId>,
    });
  };

  const handleEqualsChange = (val: string) => {
    if (!selectedController) return;
    let equals: any = val;
    if (selectedController.kind === "checkbox") {
      equals = val === "true";
    }
    onChange({
      visibleIf: {
        when: selectedController.id as TId,
        equals,
      } as Condition<TId>,
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
                {(selectedController as any).options?.map(
                  (opt: any, idx: number) => (
                    <option key={idx} value={opt.value}>
                      {opt.label}
                    </option>
                  )
                )}
              </select>
            )}
          </div>
        </div>
      )}
      {!enabled && controllers.length > 0 && (
        <p className="mt-1 text-[11px] text-gray-500">
          Show this field only when a previous field has a specific value.
        </p>
      )}
      {controllers.length === 0 && (
        <p className="mt-1 text-[11px] text-gray-400">
          No earlier checkbox/select/radio fields available to reference.
        </p>
      )}
    </div>
  );
}
