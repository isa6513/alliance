import React, { useMemo } from "react";
import type {
  FormResponseDto,
  FormResponseOutputDto,
} from "@alliance/shared/client";
import { getApiUrl } from "../lib/config";
import Card from "../ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import { cn } from "@alliance/shared/styles/util";
import ImageLightbox from "../ui/ImageLightbox";
import RenderDisplayBlock from "./RenderDisplayBlock";
import RenderField from "./RenderField";
import type {
  AnyField,
  CityFieldValue,
  DeviceVisibilityTarget,
  FormSchema,
  FormValue,
  ListField,
  OutputBlock,
  OutputViewSchema,
} from "@alliance/shared/forms/formschema";
import type { DisplayBlock } from "@alliance/shared/forms/display-blocks";
import { isElementCurrentlyVisible } from "@alliance/shared/formrenderer";

type OutputRendererProps = {
  schema?: FormSchema;
  submission?: FormResponseOutputDto | FormResponseDto | null;
  answers?: Record<string, FormValue>;
  viewId?: string;
  validatorResults?: Record<number, boolean>;
  deviceType?: DeviceVisibilityTarget;
  className?: string;
};
type SubmissionWithPublicAnswers =
  | (FormResponseOutputDto & { publicAnswers?: Record<string, boolean> })
  | (FormResponseDto & { publicAnswers?: Record<string, boolean> });

const isCityValue = (value: unknown): value is CityFieldValue => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.countryName === "string" &&
    "id" in candidate
  );
};

const formatCity = (value: CityFieldValue | string): string => {
  if (typeof value === "string") {
    return value;
  }
  const region = value.admin1?.trim();
  const country = value.countryName?.trim();
  const locationParts = [region, country].filter(
    (part): part is string => !!part && part.length > 0
  );
  const suffix = locationParts.length ? `, ${locationParts.join(", ")}` : "";
  return `${value.name}${suffix}`;
};

const isBlockVisible = (
  block: OutputBlock,
  answers: Record<string, FormValue>,
  validatorResults?: Record<number, boolean>,
  deviceType?: DeviceVisibilityTarget,
  inputField?: AnyField
): boolean => {
  if (inputField) {
    const isVisible = isElementCurrentlyVisible(inputField, answers, {
      deviceType: deviceType ?? "desktop",
      visibilityValidatorResults: validatorResults ?? {},
    });
    if (!isVisible) {
      return false;
    }
  }
  if ("fieldId" in block && !answers[block.fieldId]) {
    return false;
  }
  return isElementCurrentlyVisible(block as AnyField | DisplayBlock, answers, {
    deviceType: deviceType ?? "desktop",
    visibilityValidatorResults: validatorResults ?? {},
  });
};

const collectFieldMap = (schema: FormSchema): Map<string, AnyField> => {
  const map = new Map<string, AnyField>();
  schema.pages.forEach((page) => {
    page.fields.forEach((field) => {
      if ("kind" in field && "label" in field) {
        map.set(field.id, field);
      }
    });
  });
  return map;
};

const resolveView = (
  schema: FormSchema,
  viewId?: string
): OutputViewSchema | null => {
  const views = schema.outputViews ?? [];
  if (!views.length) {
    return null;
  }
  if (viewId) {
    const view = views.find((candidate) => candidate.id === viewId);
    if (view) {
      return view;
    }
  }
  const defaultView =
    views.find((candidate) => candidate.type === "default") ?? views[0];
  return defaultView ?? null;
};

const formatValue = (field: AnyField, value: FormValue | undefined): string => {
  if (!value) {
    return "";
  }
  switch (field.kind) {
    case "checkbox":
      return value ? "Yes" : "No";
    case "radio":
    case "select": {
      const stringValue = String(value);
      const label =
        field.options?.find((option) => option.value === stringValue)?.label ??
        stringValue;
      return label;
    }
    case "multiselect": {
      const values = Array.isArray(value) ? value : [];
      if (!values.length) return "";
      return values
        .map((entry) => {
          const label =
            field.options?.find((option) => option.value === entry)?.label ??
            entry;
          return label;
        })
        .join(", ");
    }
    case "range": {
      return value ? String(value) : "";
    }
    case "city":
      if (isCityValue(value)) {
        return formatCity(value);
      }
      return value ? formatCity(String(value)) : "";
    default:
      return Array.isArray(value)
        ? value.join(", ")
        : typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : String(value);
  }
};

const renderOutputFieldValue = (
  field: AnyField | undefined,
  value: FormValue | undefined
): React.ReactNode => {
  if (!field) {
    return (
      <span className="text-xs text-gray-500">Field removed from form.</span>
    );
  }
  if (field.kind === "file") {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-xs text-gray-500">No file uploaded</span>;
    }
    const rawValues = Array.isArray(value) ? value : [value];
    const imageUrls = rawValues
      .filter((entry): entry is string => Boolean(entry))
      .map((entry) => `${getApiUrl()}/images/${entry}`);
    if (!imageUrls.length) {
      return <span className="text-xs text-gray-500">No file uploaded</span>;
    }
    return (
      <ImageLightbox
        images={imageUrls}
        renderPreview={(openLightbox) => (
          <div className="flex flex-wrap gap-2">
            {imageUrls.map((src, idx) => (
              <button
                type="button"
                key={idx}
                className="focus:outline-none"
                onClick={(e) => openLightbox(idx, e)}
              >
                <img
                  src={src}
                  alt="Uploaded file"
                  className="w-28 h-28 object-cover rounded"
                />
              </button>
            ))}
          </div>
        )}
      />
    );
  }
  const formatted = formatValue(field, value);
  if (!formatted) {
    return <span className="text-sm text-gray-400">No response</span>;
  }
  return <span className="text-sm text-gray-900">{formatted}</span>;
};

export function OutputRenderer({
  schema,
  submission,
  answers,
  viewId,
  validatorResults,
  deviceType,
  className = "",
}: OutputRendererProps) {
  const effectiveSchema =
    schema ?? (submission?.schemaSnapshot as unknown as FormSchema | undefined);
  const fieldLookup = useMemo(
    () => (effectiveSchema ? collectFieldMap(effectiveSchema) : new Map()),
    [effectiveSchema]
  );
  const selectedView = effectiveSchema
    ? resolveView(effectiveSchema, viewId)
    : null;
  const resolvedAnswers = useMemo((): Record<string, FormValue> => {
    if (answers) {
      return answers;
    }
    if (submission?.answers) {
      return submission.answers as Record<string, FormValue>;
    }
    return {};
  }, [answers, submission]);
  const resolvedValidatorResults =
    validatorResults ??
    (submission?.visibilityValidatorResults as Record<number, boolean>) ??
    undefined;
  const resolvedDeviceType =
    deviceType ?? (submission?.deviceType as DeviceVisibilityTarget);
  const resolvedPublicAnswers = (
    submission as SubmissionWithPublicAnswers | undefined
  )?.publicAnswers;

  if (!selectedView || !effectiveSchema) {
    return (
      <div className={className}>
        <p className="text-sm text-gray-500">
          No output views configured for this form.
        </p>
      </div>
    );
  }

  const blocks = selectedView.blocks ?? [];

  const visibleBlocks = blocks.filter(
    (block) =>
      isBlockVisible(
        block,
        resolvedAnswers,
        resolvedValidatorResults,
        resolvedDeviceType,
        "fieldId" in block ? fieldLookup.get(block.fieldId) : undefined
      ) &&
      ("kind" in block ||
        (resolvedPublicAnswers &&
          resolvedPublicAnswers[block.fieldId] === true))
  );
  if (visibleBlocks.length === 0) {
    return null;
  }

  return (
    <Card style={CardStyle.Grey}>
      <div className={cn("space-y-2", className)}>
        {visibleBlocks.map((block, index) => {
          const key =
            "kind" in block ? block.id ?? `${block.kind}-${index}` : block.id;
          if ("kind" in block) {
            return <RenderDisplayBlock block={block} key={key} />;
          }

          const field = fieldLookup.get(block.fieldId);
          const label = block.labelOverride ?? field?.label ?? "Missing field";
          const showLabel = block.showLabel ?? true;
          const content = renderOutputFieldValue(
            field,
            resolvedAnswers[block.fieldId]
          );
          if (block.format === "card") {
            return (
              <Card key={key}>
                {showLabel && (
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {label}
                  </p>
                )}
                <div className="text-lg">{content}</div>
              </Card>
            );
          }
          if (block.format === "textonly") {
            return (
              <div key={key} className="text-sm text-gray-900">
                {showLabel && (
                  <span className="font-medium text-gray-700">{label}: </span>
                )}
                {content}
              </div>
            );
          }
          if (!field) {
            return null;
          }
          const withLabel: AnyField = {
            ...field,
            label: block.showLabel ? block.labelOverride ?? field.label : null,
            required: false,
          };
          if (field.kind === "list") {
            const listField = field as ListField;
            if (
              Array.isArray(listField.fields) &&
              listField.fields.length > 0
            ) {
              (withLabel as ListField).fields = listField.fields.map((sub) => ({
                ...sub,
                required: false,
              }));
            }
          }
          return (
            <div key={key} className="space-y-1">
              <RenderField
                field={withLabel}
                disabled={true}
                value={resolvedAnswers[block.fieldId]}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default OutputRenderer;
