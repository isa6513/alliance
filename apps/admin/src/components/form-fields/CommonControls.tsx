import { useEffect, useState, type ChangeEvent } from "react";
import {
  tasksCustomValidators,
  type CustomValidatorDto,
} from "@alliance/shared/client";
import type { DisplayBlock } from "@alliance/shared/forms/display-blocks";
import type {
  AnyField,
  CheckboxField,
  Condition,
  MultiSelectField,
  RadioField,
  SelectField,
} from "@alliance/shared/forms/formschema";

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
type ConditionalVisibilityProps = {
  field: (AnyField | DisplayBlock) & { visibleIf?: Condition };
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

// ---------------- Custom Validators ----------------

let cachedValidators: CustomValidatorDto[] | null = null;
let cachedValidatorsError: string | null = null;
let pendingValidatorsRequest: Promise<CustomValidatorDto[]> | null = null;

async function fetchCustomValidators(): Promise<CustomValidatorDto[]> {
  const response = await tasksCustomValidators();
  if (response.data) {
    return response.data;
  }

  if (response.error) {
    throw response.error;
  }

  throw new Error("Unknown error loading custom validators");
}

function useCustomValidators(): {
  validators: CustomValidatorDto[];
  loading: boolean;
  error: string | null;
} {
  const [validators, setValidators] = useState<CustomValidatorDto[]>(
    () => cachedValidators ?? [],
  );
  const [loading, setLoading] = useState<boolean>(
    () => !cachedValidators && !cachedValidatorsError,
  );
  const [error, setError] = useState<string | null>(
    () => cachedValidatorsError,
  );

  useEffect(() => {
    if (cachedValidators) {
      setLoading(false);
      return;
    }

    let isCancelled = false;
    if (!pendingValidatorsRequest) {
      pendingValidatorsRequest = fetchCustomValidators();
    }

    setLoading(true);

    pendingValidatorsRequest
      .then((data) => {
        if (isCancelled) return;
        cachedValidators = data;
        cachedValidatorsError = null;
        setValidators(data);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load validators";
        cachedValidatorsError = message;
        setError(message);
        setLoading(false);
      })
      .finally(() => {
        pendingValidatorsRequest = null;
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    validators,
    loading,
    error,
  };
}

type CustomValidatorSelectProps = {
  value?: number;
  onChange: (validatorId: number | undefined) => void;
  className?: string;
  label?: string;
};

export function CustomValidatorSelect({
  value,
  onChange,
  className = "",
  label = "Custom validator",
}: CustomValidatorSelectProps) {
  const { validators, loading, error } = useCustomValidators();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    if (!nextValue) {
      onChange(undefined);
      return;
    }
    onChange(Number(nextValue));
  };

  const selectedOptionMissing =
    typeof value === "number" &&
    !validators.some((validator) => validator.id === value);

  const effectiveValidators = selectedOptionMissing
    ? [
        ...validators,
        {
          id: value as number,
          name: `Validator #${value}`,
        },
      ]
    : validators;

  const hasValidators = effectiveValidators.length > 0;

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-xs font-medium text-gray-700">
        {label}
      </label>
      <select
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
        value={value ? String(value) : ""}
        onChange={handleChange}
        disabled={loading || (!hasValidators && !value)}
      >
        <option value="">None</option>
        {effectiveValidators.map((validator) => (
          <option key={validator.id} value={validator.id}>
            {validator.name}
          </option>
        ))}
      </select>
      {loading && (
        <p className="text-[11px] text-gray-500">Loading validators…</p>
      )}
      {error && !loading && (
        <p className="text-[11px] text-red-500">{error}</p>
      )}
      {!loading && !hasValidators && !error && (
        <p className="text-[11px] text-gray-500">No custom validators found.</p>
      )}
    </div>
  );
}
