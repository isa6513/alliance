import { useMemo } from "react";
import FormMarkdownWrapper from "../ui/FormMarkdownWrapper";
import type { AnyField, FormValue } from "./formschema";
import { shuffleWithSeed } from "./randomutils";

export type RenderFieldProps = {
  field: AnyField;
  value?: FormValue;
  onChange?: (value: FormValue) => void;
  disabled?: boolean;
  // File upload hooks (used by file field)
  onFileSelected?: (file: File) => void;
  uploading?: boolean;
  uploadError?: string | null;
  error?: string | null;
  randomizationKey?: string;
  disableOptionRandomization?: boolean;
};

export function RenderLabel({
  field,
  error,
}: {
  field: AnyField;
  error?: string | null;
}) {
  const hasError = Boolean(error);
  return (
    <label className={`block ${hasError ? "text-red-600" : "text-gray-700"}`}>
      <FormMarkdownWrapper markdownContent={field.label} inline />
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export function RenderField({
  field,
  value,
  onChange,
  disabled,
  onFileSelected,
  uploading,
  uploadError,
  error,
  randomizationKey,
  disableOptionRandomization,
}: RenderFieldProps) {
  const errorMessage =
    typeof error === "string" && error.trim().length > 0 ? error : null;
  const hasError = Boolean(errorMessage);
  const randomizationSeedBase =
    randomizationKey && randomizationKey.length > 0
      ? `${randomizationKey}:${field.id}`
      : field.id;
  const randomizedOptions = useMemo(() => {
    if (
      field.kind !== "radio" &&
      field.kind !== "multiselect" &&
      field.kind !== "select"
    ) {
      return null;
    }
    const options = field.options ?? [];
    if (
      disableOptionRandomization ||
      !field.randomizeOptions ||
      options.length <= 1
    ) {
      return options;
    }
    return shuffleWithSeed(options, randomizationSeedBase);
  }, [field, randomizationSeedBase, disableOptionRandomization]);

  const composeClassName = (
    base: string,
    overrides: { normal?: string; error?: string } = {}
  ) => {
    const normal =
      overrides.normal ??
      "border border-zinc-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const errorCls =
      overrides.error ??
      "border border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent";
    return `${base} ${hasError ? errorCls : normal}`;
  };

  const renderValidationMessage = () =>
    hasError ? <p className="text-sm text-red-600">{errorMessage}</p> : null;

  switch (field.kind) {
    case "text":
      return (
        <div className="space-y-1">
          <RenderLabel field={field} error={errorMessage} />
          <input
            type="text"
            value={(value as string) ?? ""}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            required={field.required}
            disabled={disabled}
            aria-invalid={hasError}
            className={composeClassName(
              "w-full px-3 py-2 rounded focus:outline-none",
              {
                normal:
                  "border border-zinc-300 focus:ring-1 focus:ring-green focus:border-transparent",
                error:
                  "border border-red-500 focus:ring-1 focus:ring-red-500 focus:border-transparent",
              }
            )}
            placeholder={field.placeholder}
          />
          {renderValidationMessage()}
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-1">
          <RenderLabel field={field} error={errorMessage} />
          <textarea
            ref={(el) => {
              if (el) {
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }
            }}
            rows={field.rows || 3}
            maxLength={field.maxLength}
            value={(value as string) ?? ""}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            required={field.required}
            disabled={disabled}
            aria-invalid={hasError}
            className={composeClassName(
              "w-full px-3 py-2 rounded-md focus:outline-none resize-none"
            )}
          />
          {renderValidationMessage()}
          {field.maxLength && (
            <p className="text-xs text-gray-500 mt-1">
              Maximum {field.maxLength} characters
            </p>
          )}
        </div>
      );

    case "email":
      return (
        <div className="space-y-1">
          <RenderLabel field={field} error={errorMessage} />
          <input
            type="email"
            value={(value as string) ?? ""}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            required={field.required}
            disabled={disabled}
            aria-invalid={hasError}
            className={composeClassName(
              "w-full px-3 py-2 rounded-md focus:outline-none"
            )}
            placeholder="Enter email address..."
          />
          {renderValidationMessage()}
        </div>
      );

    case "phone":
      return (
        <div className="space-y-1">
          <RenderLabel field={field} error={errorMessage} />
          <input
            type="tel"
            value={(value as string) ?? ""}
            onChange={
              onChange
                ? (e) => {
                    const raw = e.target.value;
                    const sanitized = raw.replace(/[^0-9+\-()\s]/g, "");
                    onChange(sanitized);
                  }
                : undefined
            }
            required={field.required}
            disabled={disabled}
            pattern={field.pattern}
            aria-invalid={hasError}
            className={composeClassName(
              "w-full px-3 py-2 rounded-md focus:outline-none"
            )}
            placeholder={field.placeholder || "Enter phone number"}
          />
          {renderValidationMessage()}
        </div>
      );

    case "number":
      return (
        <div className="space-y-1">
          <RenderLabel field={field} error={errorMessage} />
          <input
            type="number"
            value={
              value === undefined || value === null
                ? ""
                : (value as number | string)
            }
            onChange={
              onChange
                ? (e) =>
                    onChange(
                      e.target.value === "" ? "" : parseFloat(e.target.value)
                    )
                : undefined
            }
            required={field.required}
            disabled={disabled}
            min={field.min}
            max={field.max}
            step={field.step}
            aria-invalid={hasError}
            className={composeClassName(
              "w-full px-3 py-2 rounded-md focus:outline-none"
            )}
          />
          {renderValidationMessage()}
          {field.min !== undefined || field.max !== undefined ? (
            <p className="text-xs text-gray-500 mt-1">
              {field.min !== undefined && field.max !== undefined
                ? `Range: ${field.min} - ${field.max}`
                : field.min !== undefined
                ? `Minimum: ${field.min}`
                : `Maximum: ${field.max}`}
            </p>
          ) : null}
        </div>
      );

    case "checkbox":
      return (
        <div className="space-y-1">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={!!value}
              onChange={
                onChange ? (e) => onChange(e.target.checked) : undefined
              }
              required={field.required}
              disabled={disabled}
              aria-invalid={hasError}
              className={composeClassName(
                `mt-1 mr-2 h-4 w-4 ${
                  hasError ? "text-red-600" : "text-blue-600"
                } focus:outline-none rounded`,
                {
                  normal:
                    "border border-zinc-300 focus:ring-blue-500 focus:ring-2",
                  error:
                    "border border-red-500 focus:ring-red-500 focus:ring-2",
                }
              )}
            />
            <RenderLabel field={field} error={errorMessage} />
          </label>
          {renderValidationMessage()}
        </div>
      );

    case "radio": {
      const options = randomizedOptions ?? field.options;
      return (
        <div className="space-y-2">
          <RenderLabel field={field} error={errorMessage} />
          <div
            className={`space-y-2 ${
              hasError ? "border-l-2 border-red-500 pl-3" : ""
            }`}
          >
            {options.map((option, optIndex) => (
              <label key={optIndex} className="flex items-start">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={
                    onChange ? (e) => onChange(e.target.value) : undefined
                  }
                  required={field.required}
                  disabled={disabled}
                  aria-invalid={hasError}
                  className={composeClassName(
                    `mt-1 mr-2 h-4 w-4 ${
                      hasError ? "text-red-600" : "text-blue-600"
                    } focus:outline-none`,
                    {
                      normal:
                        "border border-zinc-300 focus:ring-blue-500 focus:ring-2",
                      error:
                        "border border-red-500 focus:ring-red-500 focus:ring-2",
                    }
                  )}
                />
                <span className={hasError ? "text-red-600" : "text-gray-700"}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          {renderValidationMessage()}
        </div>
      );
    }

    case "select": {
      const options = randomizedOptions ?? field.options;
      return (
        <div className="space-y-1">
          <RenderLabel field={field} error={errorMessage} />
          <select
            value={(value as string) ?? ""}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            required={field.required}
            disabled={disabled}
            aria-invalid={hasError}
            className={composeClassName(
              "w-full px-3 py-2 rounded-md focus:outline-none has-[option.placeholder:checked]:text-gray-400"
            )}
          >
            <option value="" className="placeholder" disabled>
              Select an option
            </option>
            {options.map((option, optIndex) => (
              <option key={optIndex} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderValidationMessage()}
        </div>
      );
    }

    case "multiselect": {
      const selectedCount = Array.isArray(value) ? value.length : 0;
      const options = randomizedOptions ?? field.options;
      return (
        <div className="space-y-2">
          <RenderLabel field={field} error={errorMessage} />
          <div
            className={`space-y-2 ${
              hasError ? "border-l-2 border-red-500 pl-3" : ""
            }`}
          >
            {options.map((option, optIndex) => (
              <label key={optIndex} className="flex items-center">
                <input
                  type="checkbox"
                  name={field.id}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={
                    onChange
                      ? (e) => {
                          const currentValues = Array.isArray(value)
                            ? value
                            : [];
                          if (e.target.checked) {
                            onChange([...currentValues, option.value]);
                          } else {
                            onChange(
                              currentValues.filter((v) => v !== option.value)
                            );
                          }
                        }
                      : undefined
                  }
                  required={
                    !!field.required && selectedCount === 0 && optIndex === 0
                  }
                  disabled={disabled}
                  aria-invalid={hasError}
                  className={composeClassName(
                    `mr-2 h-4 w-4 ${
                      hasError ? "text-red-600" : "text-blue-600"
                    } focus:outline-none rounded`,
                    {
                      normal:
                        "border border-zinc-300 focus:ring-blue-500 focus:ring-2",
                      error:
                        "border border-red-500 focus:ring-red-500 focus:ring-2",
                    }
                  )}
                />
                <span className={hasError ? "text-red-600" : "text-gray-700"}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          {renderValidationMessage()}
        </div>
      );
    }

    case "date":
      return (
        <div className="space-y-1">
          <RenderLabel field={field} error={errorMessage} />
          <input
            type="date"
            value={(value as string) ?? ""}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            required={field.required}
            disabled={disabled}
            aria-invalid={hasError}
            className={composeClassName(
              "w-full px-3 py-2 rounded-md focus:outline-none"
            )}
          />
          {renderValidationMessage()}
        </div>
      );

    case "file": {
      const fileValue = value;
      const isUploading = !!uploading;
      const err = uploadError;
      return (
        <div className="space-y-2">
          <RenderLabel field={field} error={errorMessage} />
          {typeof fileValue === "string" && fileValue && (
            <div className="mb-2">
              <img
                src={fileValue}
                alt="Uploaded file"
                className="max-w-full h-auto max-h-32 rounded border"
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || disabled) return;
                if (onFileSelected) onFileSelected(file);
              }}
              required={field.required && !fileValue}
              disabled={disabled || isUploading}
              aria-invalid={hasError}
              className={composeClassName(
                "flex-1 px-3 py-2 rounded-md focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              )}
            />
            {isUploading && (
              <span className=" text-blue-600">Uploading...</span>
            )}
          </div>

          {renderValidationMessage()}

          {err && <p className=" text-red-600">{err}</p>}
        </div>
      );
    }

    default:
      return null;
  }
}

export default RenderField;
