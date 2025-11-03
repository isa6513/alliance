import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  CustomValidatorType,
  CustomValidatorTypeDto,
  tasksCreateCustomValidator,
  tasksCustomValidators,
  tasksFindOneCustomValidator,
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
  field: (AnyField | DisplayBlock) & { visibleIf?: Condition[] | Condition };
  previousFields: AnyField[];
  // Only updates the "visibleIf" property for a field
  onChange: (updates: { visibleIf?: Condition[] }) => void;
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

type FieldCondition = Extract<Condition, { when: string }>;
type ValidatorCondition = Extract<Condition, { validatorId: number }>;

function isFieldCondition(cond: Condition): cond is FieldCondition {
  return "when" in cond;
}

function isValidatorCondition(cond: Condition): cond is ValidatorCondition {
  return "validatorId" in cond;
}

function normalizeConditions(input?: Condition[] | Condition): Condition[] {
  if (!input) return [];
  return Array.isArray(input) ? input : [input];
}

export function ConditionalVisibility({
  field,
  previousFields,
  onChange,
}: ConditionalVisibilityProps) {
  const controllers = (previousFields || []).filter((f): f is ControllerField =>
    isConditionalController(f)
  );
  const {
    validators,
    loading: validatorsLoading,
    error: validatorsError,
  } = useCustomValidators();
  const usableValidators = useMemo(
    () => validators.filter((validator) => validator.usableForVisibility),
    [validators]
  );

  const conditions = useMemo(
    () => normalizeConditions(field.visibleIf),
    [field.visibleIf]
  );

  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(
    () => conditions.length > 0
  );
  useEffect(() => {
    if (conditions.length > 0) {
      setIsEditorOpen(true);
    }
  }, [conditions.length]);

  const [conditionError, setConditionError] = useState<string | null>(null);

  const canUseFieldControllers = controllers.length > 0;
  const canUseValidators = usableValidators.length > 0;
  const toggleDisabled = !canUseFieldControllers && !canUseValidators;

  const updateConditions = useCallback(
    (next: Condition[]) => {
      setConditionError(null);
      onChange({ visibleIf: next.length > 0 ? next : undefined });
    },
    [onChange]
  );

  const removeCondition = useCallback(
    (index: number) => {
      const next = conditions.filter((_, idx) => idx !== index);
      updateConditions(next);
    },
    [conditions, updateConditions]
  );

  const createDefaultFieldCondition = useCallback((): FieldCondition | null => {
    const first = controllers[0];
    if (!first) return null;
    let defaultEquals: FieldCondition["equals"];
    if (first.kind === "checkbox") {
      defaultEquals = true;
    } else {
      defaultEquals = first.options?.[0]?.value ?? "";
    }
    return {
      when: first.id,
      equals: defaultEquals,
    };
  }, [controllers]);

  const addFieldCondition = useCallback((): boolean => {
    const condition = createDefaultFieldCondition();
    if (!condition) {
      setConditionError(
        "Add a checkbox, select, radio, or multiselect field earlier on this page first."
      );
      return false;
    }
    const next = [...conditions, condition];
    updateConditions(next);
    return true;
  }, [conditions, createDefaultFieldCondition, updateConditions]);

  const pickDefaultValidatorType = useCallback(():
    | CustomValidatorType
    | undefined => {
    const withoutId = usableValidators.find(
      (validator) => !validator.withIdField
    );
    return withoutId?.id ?? usableValidators[0]?.id;
  }, [usableValidators]);

  const [validatorConfigs, setValidatorConfigs] = useState<
    Record<number, { type: CustomValidatorType; idArgument?: number }>
  >({});
  const pendingValidatorFetch = useRef<Set<number>>(new Set());

  useEffect(() => {
    const missing = conditions
      .filter(isValidatorCondition)
      .map((condition) => condition.validatorId)
      .filter(
        (id) =>
          validatorConfigs[id] === undefined &&
          !pendingValidatorFetch.current.has(id)
      );
    if (!missing.length) {
      return;
    }

    let cancelled = false;
    missing.forEach((id) => pendingValidatorFetch.current.add(id));
    Promise.all(
      missing.map(async (id) => {
        try {
          const response = await tasksFindOneCustomValidator({
            path: { id },
          });
          if (!response.data) {
            throw new Error("Missing validator data");
          }
          return [
            id,
            { type: response.data.type, idArgument: response.data.idArgument },
          ] as const;
        } catch (error) {
          console.error("Failed to load visibility validator", error);
          return [id, undefined] as const;
        }
      })
    )
      .then((entries) => {
        if (cancelled) return;
        setValidatorConfigs((prev) => {
          const next = { ...prev };
          for (const [id, config] of entries) {
            if (config) {
              next[id] = config;
            }
          }
          return next;
        });
      })
      .finally(() => {
        missing.forEach((id) => pendingValidatorFetch.current.delete(id));
      });

    return () => {
      cancelled = true;
    };
  }, [conditions, validatorConfigs]);

  const ensureValidatorRecord = useCallback(
    async (type: CustomValidatorType, idArgument?: number) => {
      const result = await tasksCreateCustomValidator({
        body: { type, idArgument },
      });
      if (!result.data) {
        throw new Error("createCustomValidator returned no data");
      }
      setValidatorConfigs((prev) => ({
        ...prev,
        [result.data.id]: { type, idArgument },
      }));
      return result.data.id;
    },
    []
  );

  const addValidatorCondition = useCallback(
    async (opts?: {
      type?: CustomValidatorType;
      idArgument?: number;
      resultEquals?: boolean;
    }): Promise<boolean> => {
      const desiredType = opts?.type ?? pickDefaultValidatorType();
      if (!desiredType) {
        setConditionError(
          "No custom validators are available for conditional visibility."
        );
        return false;
      }
      try {
        const validatorId = await ensureValidatorRecord(
          desiredType,
          opts?.idArgument
        );
        const nextCondition: ValidatorCondition = {
          validatorId,
          resultEquals: opts?.resultEquals ?? true,
        };
        const next = [...conditions, nextCondition];
        updateConditions(next);
        return true;
      } catch (error) {
        console.error("Failed to configure visibility validator", error);
        setConditionError(
          "Unable to configure the selected validator right now."
        );
        return false;
      }
    },
    [
      conditions,
      ensureValidatorRecord,
      pickDefaultValidatorType,
      updateConditions,
    ]
  );

  const handleEnableToggle = async (checked: boolean) => {
    if (!checked) {
      setIsEditorOpen(false);
      setConditionError(null);
      updateConditions([]);
      return;
    }
    setConditionError(null);
    setIsEditorOpen(true);
    if (conditions.length === 0 && canUseFieldControllers) {
      addFieldCondition();
    }
  };

  const handleControllerChange = useCallback(
    (index: number, id: string) => {
      const nextField = controllers.find((f) => f.id === id);
      if (!nextField) {
        return;
      }
      let nextEquals: FieldCondition["equals"];
      if (nextField.kind === "checkbox") {
        nextEquals = true;
      } else {
        nextEquals = nextField.options?.[0]?.value ?? "";
      }
      const next = [...conditions];
      next[index] = {
        when: nextField.id,
        equals: nextEquals,
      };
      updateConditions(next);
    },
    [conditions, controllers, updateConditions]
  );

  const handleEqualsChange = useCallback(
    (index: number, value: string) => {
      const next = [...conditions];
      const current = next[index];
      if (!isFieldCondition(current)) {
        return;
      }
      const controller = controllers.find((f) => f.id === current.when);
      if (!controller) {
        return;
      }
      const equals = controller.kind === "checkbox" ? value === "true" : value;
      next[index] = {
        when: current.when,
        equals,
      };
      updateConditions(next);
    },
    [conditions, controllers, updateConditions]
  );

  const handleValidatorSelection = useCallback(
    async (
      index: number,
      validatorType: CustomValidatorType | undefined,
      idArgument?: number
    ) => {
      if (!validatorType) {
        removeCondition(index);
        return;
      }
      try {
        const validatorId = await ensureValidatorRecord(
          validatorType,
          idArgument
        );
        const next = [...conditions];
        const existing = next[index];
        const resultEquals = isValidatorCondition(existing)
          ? existing.resultEquals ?? true
          : true;
        next[index] = {
          validatorId,
          resultEquals,
        };
        updateConditions(next);
      } catch (error) {
        console.error("Failed to configure visibility validator", error);
        setConditionError(
          "Unable to configure the selected validator right now."
        );
      }
    },
    [conditions, ensureValidatorRecord, removeCondition, updateConditions]
  );

  const handleValidatorExpectationChange = useCallback(
    (index: number, value: string) => {
      const next = [...conditions];
      const condition = next[index];
      if (!isValidatorCondition(condition)) {
        return;
      }
      next[index] = {
        ...condition,
        resultEquals: value === "true",
      };
      updateConditions(next);
    },
    [conditions, updateConditions]
  );

  const renderFieldCondition = (condition: FieldCondition, index: number) => {
    const controller = controllers.find((f) => f.id === condition.when);
    return (
      <div className="space-y-2">
        <div>
          <label className="block text-xs text-gray-700 mb-1">
            Show when field
          </label>
          <select
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={controller ? controller.id : controllers[0]?.id ?? ""}
            onChange={(event) =>
              handleControllerChange(index, event.target.value)
            }
          >
            {controllers.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {controller ? (
          <div>
            <label className="block text-xs text-gray-700 mb-1">equals</label>
            {controller.kind === "checkbox" ? (
              <select
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={String(!!condition.equals)}
                onChange={(event) =>
                  handleEqualsChange(index, event.target.value)
                }
              >
                <option value="true">Checked</option>
                <option value="false">Unchecked</option>
              </select>
            ) : (
              <select
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={String(condition.equals ?? "")}
                onChange={(event) =>
                  handleEqualsChange(index, event.target.value)
                }
              >
                {controller.options?.map((opt, idx) => (
                  <option key={idx} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-gray-400">
            Select a field to compare before configuring a value.
          </p>
        )}
      </div>
    );
  };

  const renderValidatorCondition = (
    condition: ValidatorCondition,
    index: number
  ) => {
    const config = validatorConfigs[condition.validatorId];
    return (
      <div className="space-y-2">
        <CustomValidatorSelect
          type={config?.type}
          idArgument={config?.idArgument}
          onChange={(validatorType, idArgument) =>
            void handleValidatorSelection(index, validatorType, idArgument)
          }
          filter={(validator) => validator.usableForVisibility}
          label="Visibility validator"
        />
        {!config && !validatorsLoading && (
          <p className="text-[11px] text-gray-400">
            Loading validator details…
          </p>
        )}
        <div>
          <label className="block text-xs text-gray-700 mb-1">
            Show when validator result is
          </label>
          <select
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={String(condition.resultEquals ?? true)}
            onChange={(event) =>
              handleValidatorExpectationChange(index, event.target.value)
            }
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="border-gray-200 pt-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700">
          Conditional visibility
        </label>
        <input
          type="checkbox"
          className={`h-4 w-4 ${toggleDisabled ? "opacity-30" : ""}`}
          checked={isEditorOpen}
          onChange={(e) => void handleEnableToggle(e.target.checked)}
          disabled={toggleDisabled}
          title={
            toggleDisabled
              ? "Add an eligible field or configure a validator to enable this feature"
              : undefined
          }
        />
      </div>

      {toggleDisabled && (
        <p className="mt-1 text-[11px] text-gray-400">
          No earlier checkbox/select/radio fields or visibility validators are
          available.
        </p>
      )}

      {conditionError && (
        <p className="mt-1 text-[11px] text-red-500">{conditionError}</p>
      )}

      {isEditorOpen && (
        <div className="mt-2 space-y-3">
          {conditions.map((condition, index) => (
            <div
              key={index}
              className="rounded border border-gray-200 bg-white p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">
                  Condition {index + 1}
                </span>
                <button
                  type="button"
                  className="text-[11px] text-gray-500 hover:text-red-500"
                  onClick={() => removeCondition(index)}
                >
                  Remove
                </button>
              </div>
              {isFieldCondition(condition) ? (
                renderFieldCondition(condition, index)
              ) : isValidatorCondition(condition) ? (
                renderValidatorCondition(condition, index)
              ) : (
                <p className="text-[11px] text-red-500">
                  Unsupported condition type. Remove and re-create this rule.
                </p>
              )}
            </div>
          ))}

          {conditions.length === 0 && (
            <p className="text-[11px] text-gray-500">
              No conditions configured yet. Add at least one rule below.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              onClick={() => {
                if (!addFieldCondition()) {
                  return;
                }
              }}
              disabled={!canUseFieldControllers}
            >
              + Field condition
            </button>
            <button
              type="button"
              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              onClick={() => void addValidatorCondition()}
              disabled={!canUseValidators}
            >
              + Validator condition
            </button>
          </div>
          {!canUseFieldControllers && (
            <p className="text-[11px] text-gray-400">
              Add a checkbox, select, radio, or multiselect field earlier on
              this page to use answer-based visibility.
            </p>
          )}
          {!canUseValidators && (
            <p className="text-[11px] text-gray-400">
              No custom validators are currently available for visibility.
            </p>
          )}
          {validatorsLoading && (
            <p className="text-[11px] text-gray-500">
              Loading visibility validators…
            </p>
          )}
          {validatorsError && !validatorsLoading && (
            <p className="text-[11px] text-red-500">{validatorsError}</p>
          )}
        </div>
      )}
    </div>
  );
}
// ---------------- Custom Validators ----------------

let cachedValidators: CustomValidatorTypeDto[] | null = null;
let cachedValidatorsError: string | null = null;
let pendingValidatorsRequest: Promise<CustomValidatorTypeDto[]> | null = null;

async function fetchCustomValidators(): Promise<CustomValidatorTypeDto[]> {
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
  validators: CustomValidatorTypeDto[];
  loading: boolean;
  error: string | null;
} {
  const [validators, setValidators] = useState<CustomValidatorTypeDto[]>(
    () => cachedValidators ?? []
  );
  const [loading, setLoading] = useState<boolean>(
    () => !cachedValidators && !cachedValidatorsError
  );
  const [error, setError] = useState<string | null>(
    () => cachedValidatorsError
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
  type?: CustomValidatorType;
  idArgument?: number;
  onChange: (
    validatorType: CustomValidatorType | undefined,
    idArgument?: number
  ) => void;
  className?: string;
  label?: string;
  filter?: (validator: CustomValidatorTypeDto) => boolean;
};

export function CustomValidatorSelect({
  type,
  idArgument,
  onChange,
  className = "",
  label = "Custom validator",
  filter,
}: CustomValidatorSelectProps) {
  const { validators, loading, error } = useCustomValidators();
  const availableValidators = useMemo(() => {
    if (!filter) {
      return validators;
    }
    const filtered = validators.filter(filter);
    if (!type) {
      return filtered;
    }
    const selected = validators.find((validator) => validator.id === type);
    if (
      selected &&
      !filtered.some((validator) => validator.id === selected.id)
    ) {
      return [...filtered, selected];
    }
    return filtered;
  }, [validators, filter, type]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    if (!nextValue) {
      onChange(undefined, idArgument);
      return;
    }
    onChange(nextValue as CustomValidatorType, idArgument);
  };

  const hasValidators = availableValidators.length > 0;

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-xs font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <select
          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          value={type}
          onChange={handleChange}
          disabled={loading || (!hasValidators && !type)}
        >
          <option value="">None</option>
          {availableValidators.map((validator) => (
            <option key={validator.id} value={validator.id}>
              {validator.name}
            </option>
          ))}
        </select>
        {!!validators.find((validator) => validator.id === type)
          ?.withIdField && (
          <input
            type="number"
            value={idArgument ?? ""}
            onChange={(e) =>
              onChange(
                type,
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
            className="px-2 py-1 text-xs border border-gray-300 rounded bg-gray-100 w-24"
          />
        )}
      </div>
      {loading && (
        <p className="text-[11px] text-gray-500">Loading validators…</p>
      )}
      {error && !loading && <p className="text-[11px] text-red-500">{error}</p>}
      {!loading && !hasValidators && !error && (
        <p className="text-[11px] text-gray-500">No custom validators found.</p>
      )}
    </div>
  );
}

export function AutoExtractUserDataToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center text-xs text-gray-700 mt-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mr-1"
      />
      Automatically extract into user data
    </label>
  );
}
