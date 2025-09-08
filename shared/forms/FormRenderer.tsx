/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { FormDto, SubmitFormDto, imagesUploadImage } from "../client";
import AppMarkdownWrapper from "../ui/AppMarkdownWrapper";
import Button, { ButtonColor } from "../ui/Button";
import FormMarkdownWrapper from "../ui/FormMarkdownWrapper";
import type { DisplayBlock } from "./display-blocks";
import type { AnyField, Condition, FormSchema } from "./formschema";

interface FormRendererProps {
  form: FormDto["schema"];
  onSubmit: ((data: SubmitFormDto) => void) | null; // null for admin preview
  /**
   * Optional identifier to enable client-side persistence of form progress.
   * When provided, the renderer will save partial answers and page progress
   * to localStorage under a key derived from the form schema and this value.
   * Use a per-instance id (e.g., taskFormId) to avoid collisions across contexts.
   */
  persistKey?: string | null;
  onFormStarted?: () => void;
}

/**
 * Compute a stable localStorage key for a form draft.
 * Format: `form:<slug>:v<version>[:<instanceId>]`
 */
export function computeFormStorageKey(args: {
  slug: string;
  version: number;
  instanceId?: string | number | null;
}): string {
  const base = `form:${args.slug}:v${args.version}`;
  const hasInstance =
    args.instanceId !== undefined &&
    args.instanceId !== null &&
    args.instanceId !== "";
  return hasInstance ? `${base}:${String(args.instanceId)}` : base;
}

const FormRenderer = ({
  form,
  onSubmit,
  persistKey,
  onFormStarted,
}: FormRendererProps) => {
  // Compute schema and a namespaced storage key for persistence (if enabled)
  const schema = form as unknown as FormSchema<string, string>;
  const baseStorageKey = computeFormStorageKey({
    slug: schema.slug,
    version: schema.version,
  });
  const storageKey = computeFormStorageKey({
    slug: schema.slug,
    version: schema.version,
    instanceId: persistKey ?? undefined,
  });

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(() => {
    if (typeof window === "undefined" || !persistKey) return 0;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      const idx =
        typeof parsed?.currentPageIndex === "number"
          ? parsed.currentPageIndex
          : 0;
      const maxIdx = Math.max(0, (schema.pages?.length || 1) - 1);
      return Math.min(Math.max(0, idx), maxIdx);
    } catch {
      return 0;
    }
  });
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (typeof window === "undefined" || !persistKey) return {};
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed?.formData && typeof parsed.formData === "object"
        ? parsed.formData
        : {};
    } catch {
      return {};
    }
  });
  const [uploadingFields, setUploadingFields] = useState<Set<string>>(
    new Set()
  );
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [hasEmittedStart, setHasEmittedStart] = useState(false);

  const ensureStarted = () => {
    if (!hasEmittedStart) {
      try {
        onFormStarted?.();
      } finally {
        setHasEmittedStart(true);
      }
    }
  };

  const currentPage = schema.pages[currentPageIndex];
  const isLastPage = currentPageIndex === schema.pages.length - 1;
  const isFirstPage = currentPageIndex === 0;

  const updateField = (fieldId: string, value: any) => {
    ensureStarted();
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleFileUpload = async (fieldId: string, file: File) => {
    ensureStarted();
    setUploadingFields((prev) => new Set(prev).add(fieldId));
    setUploadErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === "string") {
          try {
            const { data } = await imagesUploadImage({
              body: { file: reader.result },
            });
            if (data) {
              updateField(fieldId, data);
            }
          } catch (error) {
            console.error("Failed to upload image:", error);
            setUploadErrors((prev) => ({
              ...prev,
              [fieldId]: "Failed to upload image",
            }));
          }
        }
        setUploadingFields((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fieldId);
          return newSet;
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to read file:", error);
      setUploadErrors((prev) => ({
        ...prev,
        [fieldId]: "Failed to read file",
      }));
      setUploadingFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fieldId);
        return newSet;
      });
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLastPage) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFirstPage) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLastPage) {
      setCurrentPageIndex((prev) => prev + 1);
    } else if (onSubmit) {
      onSubmit({ answers: formData });
      // Do not eagerly clear persisted data here, since we don't know if
      // submission succeeded. Caller (parent) should clear on success.
    }
  };

  // Persist progress when enabled
  useEffect(() => {
    if (!persistKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ formData, currentPageIndex, updatedAt: Date.now() })
      );
    } catch {
      // ignore storage errors (quota, private mode, etc.)
    }
  }, [formData, currentPageIndex, persistKey, storageKey]);

  // If key changes (different form/version/instance), attempt to restore
  useEffect(() => {
    if (!persistKey || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.formData && typeof parsed.formData === "object") {
        setFormData(parsed.formData);
      }
      if (typeof parsed?.currentPageIndex === "number") {
        const maxIdx = Math.max(0, (schema.pages?.length || 1) - 1);
        const idx = Math.min(Math.max(0, parsed.currentPageIndex), maxIdx);
        setCurrentPageIndex(idx);
      }
    } catch {
      // ignore invalid JSON or access errors
    }
  }, [persistKey, baseStorageKey]);

  const renderField = (field: AnyField<string>, index: number) => {
    const value = formData[field.id] || "";

    switch (field.kind) {
      case "text":
        return (
          <div key={index} className="space-y-1">
            <label className="block   text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={(field as any).placeholder}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={index} className="space-y-1">
            <label className="block text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
              rows={(field as any).rows || 3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={(field as any).placeholder}
            />
          </div>
        );

      case "email":
        return (
          <div key={index} className="space-y-1">
            <label className="block text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="email"
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={(field as any).placeholder}
            />
          </div>
        );

      case "phone":
        return (
          <div key={index} className="space-y-1">
            <label className="block   text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="tel"
              value={value}
              onChange={(e) => {
                // Only allow digits, +, spaces, dashes, and parentheses
                const sanitized = e.target.value.replace(/[^0-9+\s\-()]/g, "");
                updateField(field.id, sanitized);
              }}
              required={field.required}
              pattern={(field as any).pattern}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={(field as any).placeholder || "Enter phone number"}
            />
          </div>
        );

      case "number":
        return (
          <div key={index} className="space-y-1">
            <label className="block   text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) =>
                updateField(field.id, parseFloat(e.target.value) || "")
              }
              required={field.required}
              min={(field as any).min}
              max={(field as any).max}
              step={(field as any).step}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={(field as any).placeholder}
            />
          </div>
        );

      case "checkbox":
        return (
          <div key={index} className="space-y-1">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => updateField(field.id, e.target.checked)}
                required={field.required}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-zinc-700 flex">
                <FormMarkdownWrapper markdownContent={field.label} />
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
          </div>
        );

      case "radio":
        return (
          <div key={index} className="space-y-2">
            <label className="block   text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {(field as any).options.map((option: any, optIndex: number) => (
                <label key={optIndex} className="flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => updateField(field.id, e.target.value)}
                    required={field.required}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className=" text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "select":
        return (
          <div key={index} className="space-y-1">
            <label className="block   text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent has-[option.placeholder:checked]:text-gray-400"
            >
              <option value="" className="placeholder" selected disabled>
                Select an option
              </option>
              {(field as any).options.map((option: any, optIndex: number) => (
                <option key={optIndex} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "multiselect":
        return (
          <div key={index} className="space-y-2">
            <label className="block   text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {(field as any).options.map((option: any, optIndex: number) => (
                <label key={optIndex} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(value) && value.includes(option.value)
                    }
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        updateField(field.id, [...currentValues, option.value]);
                      } else {
                        updateField(
                          field.id,
                          currentValues.filter((v) => v !== option.value)
                        );
                      }
                    }}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className=" text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "date":
        return (
          <div key={index} className="space-y-1">
            <label className="block   text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case "file":
        const isUploading = uploadingFields.has(field.id);
        const uploadError = uploadErrors[field.id];
        const fileValue = formData[field.id];

        return (
          <div key={index} className="space-y-2">
            <label className="block   text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Show uploaded image preview if it's an image key */}
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
                  if (file) {
                    handleFileUpload(field.id, file);
                  }
                }}
                required={field.required && !fileValue}
                disabled={isUploading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file: file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              {isUploading && (
                <span className=" text-blue-600">Uploading...</span>
              )}
            </div>

            {uploadError && <p className=" text-red-600">{uploadError}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const renderDisplayBlock = (block: DisplayBlock<string>, index: number) => {
    switch (block.kind) {
      case "header":
        return React.createElement(
          `h${(block as any).level || 2}`,
          {
            key: index,
            className: `font-bold text-gray-900 ${
              ((block as any).level || 2) === 1
                ? "text-3xl"
                : ((block as any).level || 2) === 2
                ? "text-2xl"
                : ((block as any).level || 2) === 3
                ? "text-xl"
                : ((block as any).level || 2) === 4
                ? "text-lg"
                : ((block as any).level || 2) === 5
                ? "text-base"
                : ""
            }`,
          },
          (block as any).text
        );

      case "text":
        return (
          <div key={index} className="text-gray-900">
            {(block as any).markdown ? (
              <div className="prose prose-sm max-w-none">
                <AppMarkdownWrapper markdownContent={(block as any).text} />
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{(block as any).text}</p>
            )}
          </div>
        );

      case "label":
        return (
          <span key={index} className="  text-gray-700">
            {(block as any).text}
          </span>
        );

      case "divider":
        return (
          <hr
            key={index}
            className={`border-gray-300 ${
              (block as any).thickness === "hairline"
                ? "border-t"
                : (block as any).thickness === "thin"
                ? "border-t"
                : (block as any).thickness === "medium"
                ? "border-t-2"
                : (block as any).thickness === "thick"
                ? "border-t-4"
                : "border-t"
            }`}
          />
        );

      case "spacer":
        return (
          <div
            key={index}
            className={`${
              (block as any).size === "xs"
                ? "h-2"
                : (block as any).size === "sm"
                ? "h-4"
                : (block as any).size === "md"
                ? "h-8"
                : (block as any).size === "lg"
                ? "h-16"
                : (block as any).size === "xl"
                ? "h-24"
                : "h-8"
            }`}
          />
        );

      case "html":
        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: (block as any).html }}
          />
        );

      case "image":
        return (
          <img
            key={index}
            src={(block as any).src}
            alt={(block as any).alt}
            className="max-h-80 w-auto rounded"
            style={{
              aspectRatio: (block as any).aspectRatio
                ? (block as any).aspectRatio.toString()
                : undefined,
            }}
          />
        );

      default:
        return null;
    }
  };

  const renderElement = (
    element: AnyField<string> | DisplayBlock<string>,
    index: number
  ) => {
    const cond = (element as any)?.visibleIf as Condition<string> | undefined;
    if (cond) {
      const evalCond = (c: Condition<string>): boolean => {
        if ("expr" in c) {
          // Basic safeguard: do not evaluate arbitrary expressions in renderer
          // Future: support a small expression language if needed.
          return true;
        }
        const val = formData[c.when];
        // If condition expects a boolean (checkbox controllers), coerce undefined → false
        if (typeof c.equals === "boolean") {
          return Boolean(val) === c.equals;
        }
        if (Array.isArray(val)) {
          // multiselect: treat equals as "includes"
          return val.includes(c.equals as any);
        }
        return val === (c.equals as any);
      };
      if (!evalCond(cond)) return null;
    }
    // Check if it's a form field (has 'label' property) vs display block
    if ("label" in element) {
      return renderField(element as AnyField<string>, index);
    } else {
      return renderDisplayBlock(element as DisplayBlock<string>, index);
    }
  };

  return (
    <div className="mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Page Content */}
        <div className="space-y-4">
          {currentPage.fields.map((element, index) =>
            renderElement(element, index)
          )}
        </div>
        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 gap-x-3">
          {schema.pages.length > 1 && (
            <div>
              <div>
                <span className=" text-gray-500">
                  Page {currentPageIndex + 1} of {schema.pages.length}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-1 space-x-3 items-center">
            {!isFirstPage && (
              <Button
                color={ButtonColor.Light}
                type="button"
                onClick={handlePrevious}
                className=""
              >
                Previous
              </Button>
            )}

            {!isLastPage ? (
              <Button
                color={ButtonColor.Blue}
                type="button"
                onClick={handleNext}
                className=""
              >
                Next
              </Button>
            ) : onSubmit ? (
              <Button
                color={ButtonColor.Black}
                type="submit"
                className="w-full !py-3 text-base"
              >
                {schema.submit?.label || "Complete"}
              </Button>
            ) : (
              <Button
                color={ButtonColor.Grey}
                className="!cursor-not-allowed"
                onClick={() => {}}
              >
                {schema.submit?.label || "Complete"} (Preview Mode)
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormRenderer;
