import {
  actionsShareLinksForForm,
  FormResponseDto,
  ProfileDto,
  tasksGetForm,
  tasksGetFormResponses,
  type FormDto,
} from "@alliance/shared/client";
import FormRenderer from "@alliance/sharedweb/forms/FormRenderer";
import type {
  AnyField,
  FieldKind,
  FormSchema,
  Page,
} from "@alliance/shared/forms/formschema";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import Card from "@alliance/sharedweb/ui/Card";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { CirclePlay } from "lucide-react";
import { CardStyle } from "@alliance/shared/styles/card";
import FormResponseStatistics from "../components/FormResponseStatistics";

export type FormWithSchema = Pick<FormDto, "id" | "title"> & {
  schema: FormSchema;
  pages?: Page[];
};

// Runtime guard: distinguish answer fields from display blocks
const ANSWER_FIELD_KINDS = new Set<FieldKind>([
  "text",
  "textarea",
  "email",
  "number",
  "range",
  "phone",
  "checkbox",
  "radio",
  "select",
  "multiselect",
  "date",
  "time",
  "timezone",
  "city",
  "file",
]);

const FILTERABLE_FIELD_KINDS = new Set<FieldKind>([
  "checkbox",
  "radio",
  "select",
  "multiselect",
  "range",
]);

type Tab = "responses" | "stats";

type ResponseFilterOp = "equals" | "includes" | "no-response";

export type FormResponseFilter = {
  fieldId: string;
  op: ResponseFilterOp;
  value?: string;
};

const isAnswerField = (
  node: unknown
): node is { id: string; label: string } => {
  if (!node || typeof node !== "object") return false;
  const anyNode = node as { kind: string; id: string; label: string };
  return (
    typeof anyNode.kind === "string" &&
    ANSWER_FIELD_KINDS.has(anyNode.kind as FieldKind) &&
    typeof anyNode.id === "string" &&
    typeof anyNode.label === "string"
  );
};

const isResponseFilterOp = (value: string | null): value is ResponseFilterOp =>
  value === "equals" || value === "includes" || value === "no-response";

const sortResponsesByCreatedAtDesc = (
  list: FormResponseDto[]
): FormResponseDto[] => {
  return [...list].sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
};

const normalizeBoolean = (value: unknown): boolean | null => {
  if (value === true || value === false) return value;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === 1) return true;
  if (value === 0) return false;
  return null;
};

const isNoResponseValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim() === "";
  return false;
};

const getSelections = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (value === null || value === undefined || value === "") return [];
  return [String(value)];
};

const getOptionLabel = (
  field: AnyField,
  value: string | undefined
): string | undefined => {
  if (!value) return undefined;
  const options =
    (field as { options?: Array<{ value: string; label: string }> }).options ??
    [];
  return options.find((option) => String(option.value) === value)?.label;
};

const matchesResponseFilter = (
  response: FormResponseDto,
  filter: FormResponseFilter,
  field: AnyField
): boolean => {
  const rawValue = response.answers?.[filter.fieldId];
  if (filter.op === "no-response") {
    return isNoResponseValue(rawValue);
  }

  switch (field.kind) {
    case "checkbox": {
      if (filter.op !== "equals") return false;
      const desired = normalizeBoolean(filter.value);
      const actual = normalizeBoolean(rawValue);
      if (desired === null || actual === null) return false;
      return actual === desired;
    }
    case "multiselect": {
      if (filter.op !== "includes") return false;
      const selections = getSelections(rawValue);
      return selections.includes(filter.value ?? "");
    }
    case "radio":
    case "select":
    case "range": {
      if (filter.op !== "equals") return false;
      if (rawValue === null || rawValue === undefined || rawValue === "") {
        return false;
      }
      return String(rawValue) === (filter.value ?? "");
    }
    default:
      return false;
  }
};
const FormResponses: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormWithSchema | null>(null);
  const [responses, setResponses] = useState<FormResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [sidsToUserMap, setSidsToUserMap] = useState<
    Record<string, ProfileDto>
  >({});

  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) ?? "responses";
  const filterFieldId = params.get("filterField")?.trim() ?? "";
  const filterOpParam = params.get("filterOp");
  const filterValueParam = params.get("filterValue");

  const updateParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const next = new URLSearchParams(params);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      setParams(next);
    },
    [params, setParams]
  );

  const activeFilter = useMemo<FormResponseFilter | null>(() => {
    if (!filterFieldId || !isResponseFilterOp(filterOpParam)) return null;
    if (
      (filterOpParam === "equals" || filterOpParam === "includes") &&
      (filterValueParam === null || filterValueParam === "")
    ) {
      return null;
    }
    return {
      fieldId: filterFieldId,
      op: filterOpParam,
      value: filterValueParam ?? undefined,
    };
  }, [filterFieldId, filterOpParam, filterValueParam]);

  const numericFormId = useMemo(
    () => (formId ? Number(formId) : NaN),
    [formId]
  );

  useEffect(() => {
    if (form) {
      actionsShareLinksForForm({ path: { formId: form.id } }).then((res) => {
        setSidsToUserMap(
          Object.fromEntries(
            res.data?.map((r) => [
              r.sid ?? (r.data as { sid?: string })?.sid,
              r.user,
            ]) ?? []
          )
        );
      });
    }
  }, [form]);

  const loadData = useCallback(async () => {
    if (!numericFormId || Number.isNaN(numericFormId)) return;
    setLoading(true);
    setError(null);
    try {
      const [formRes, respRes] = await Promise.all([
        tasksGetForm({ path: { id: numericFormId } }),
        tasksGetFormResponses({ path: { id: numericFormId } }),
      ]);

      const formData = formRes.data as unknown as FormWithSchema;
      setForm(formData);
      if (respRes.data) {
        setResponses(sortResponsesByCreatedAtDesc(respRes.data));
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load form responses");
    } finally {
      setLoading(false);
    }
  }, [numericFormId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fieldLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    const schema = form?.schema as unknown as {
      pages?: Array<{
        fields?: Array<{ id?: string; label?: string; kind?: string }>;
      }>;
    };
    schema?.pages?.forEach((p) => {
      p.fields?.forEach((f) => {
        if (isAnswerField(f)) {
          labels[f.id] = f.label;
        }
      });
    });
    return labels;
  }, [form]);

  const orderedFieldIds = useMemo(() => {
    const ids: string[] = [];
    const seen = new Set<string>();
    const schema = form?.schema as unknown as {
      pages?: Array<{
        fields?: Array<{ id?: string; label?: string; kind?: string }>;
      }>;
    };
    schema?.pages?.forEach((p) => {
      p.fields?.forEach((f) => {
        if (isAnswerField(f) && !seen.has(f.id)) {
          seen.add(f.id);
          ids.push(f.id);
        }
      });
    });
    return ids;
  }, [form]);

  const fieldsById = useMemo(() => {
    const fields: Record<string, AnyField> = {};
    form?.schema?.pages?.forEach((page) => {
      page.fields.forEach((field) => {
        const candidate = field as AnyField;
        if (
          candidate &&
          typeof candidate === "object" &&
          typeof candidate.id === "string" &&
          typeof candidate.kind === "string"
        ) {
          fields[candidate.id] = candidate;
        }
      });
    });
    return fields;
  }, [form]);

  const activeFilterField = useMemo(() => {
    if (!activeFilter) return null;
    const field = fieldsById[activeFilter.fieldId];
    if (!field || !FILTERABLE_FIELD_KINDS.has(field.kind)) return null;
    return field;
  }, [activeFilter, fieldsById]);

  const filteredResponses = useMemo(() => {
    if (!activeFilter || !activeFilterField) return responses;
    return responses.filter((response) =>
      matchesResponseFilter(response, activeFilter, activeFilterField)
    );
  }, [responses, activeFilter, activeFilterField]);

  useEffect(() => {
    setPage(1);
  }, [filterFieldId, filterOpParam, filterValueParam]);

  useEffect(() => {
    // Keep current page in range when filtered responses change
    const totalPages = Math.max(1, filteredResponses.length);
    if (page > totalPages) setPage(totalPages);
  }, [filteredResponses.length, page]);

  const total = responses.length;
  const filteredTotal = filteredResponses.length;
  const totalPages = Math.max(1, filteredTotal);
  const currentResponse = filteredResponses[page - 1];

  const filterSummary = useMemo(() => {
    if (!activeFilter || !activeFilterField) return null;
    const fieldLabel = activeFilterField.label?.trim() || "Untitled question";
    if (activeFilter.op === "no-response") {
      return { fieldLabel, description: "No response" };
    }
    const valueLabel = activeFilter.value ?? "";
    switch (activeFilterField.kind) {
      case "checkbox": {
        const normalized = normalizeBoolean(activeFilter.value);
        if (normalized === true) {
          return { fieldLabel, description: "Checked" };
        }
        if (normalized === false) {
          return { fieldLabel, description: "Not checked" };
        }
        return null;
      }
      case "multiselect": {
        const optionLabel = getOptionLabel(activeFilterField, activeFilter.value);
        return {
          fieldLabel,
          description: `Includes ${optionLabel ?? valueLabel}`,
        };
      }
      case "radio":
      case "select": {
        const optionLabel = getOptionLabel(activeFilterField, activeFilter.value);
        return { fieldLabel, description: optionLabel ?? valueLabel };
      }
      case "range":
        return { fieldLabel, description: `Value ${valueLabel}` };
      default:
        return null;
    }
  }, [activeFilter, activeFilterField]);

  const emptyStateMessage = filterSummary
    ? "No responses match this filter."
    : "No responses yet for this form.";

  const handleStatFilter = useCallback(
    (filter: FormResponseFilter) => {
      updateParams({
        tab: "responses",
        filterField: filter.fieldId,
        filterOp: filter.op,
        filterValue: filter.value ?? null,
      });
      setPage(1);
    },
    [updateParams]
  );

  const clearFilter = useCallback(() => {
    updateParams({
      filterField: null,
      filterOp: null,
      filterValue: null,
    });
  }, [updateParams]);

  const formatValue = useCallback((v: unknown): string => {
    if (v == null || v === undefined) return "NULL";
    if (Array.isArray(v)) return v.map((x) => formatValue(x)).join(", ");
    if (typeof v === "object") {
      const o = v as { name?: string; key: string };
      if (o && typeof o === "object" && (o.name || o.key)) {
        return o.name || o.key;
      }
      try {
        return JSON.stringify(v);
      } catch {
        return String(v);
      }
    }
    return String(v);
  }, []);

  const csvEscape = (s: string): string => {
    const needsQuotes = /[",\n\r]/.test(s);
    let v = s.replace(/"/g, '""');
    v = v.replace(/\r?\n/g, " ");
    return needsQuotes ? `"${v}"` : v;
  };

  const handleExportCsv = useCallback(() => {
    if (!form) return;
    const metaHeaders = ["Response ID", "User ID", "User Name", "SID"];
    const used = new Set<string>();
    const questionHeaders = orderedFieldIds.map((id) => {
      const base = fieldLabels[id] || id;
      let name = base;
      let i = 2;
      while (used.has(name)) {
        name = `${base} (${i++})`;
      }
      used.add(name);
      return name;
    });
    const headers = [...metaHeaders, ...questionHeaders];

    const rows = responses.map((resp) => {
      const user = resp?.user;
      const userName = [user?.name ?? resp.id].filter(Boolean).join(" ");
      const values = [
        String(resp.id ?? ""),
        String(user?.id ?? ""),
        userName,
        resp.sid ?? "",
        ...orderedFieldIds.map((id) => formatValue(resp.answers?.[id])),
      ];
      return values;
    });

    const csv = [
      headers.map(csvEscape).join(","),
      ...rows.map((r) => r.map((c) => csvEscape(String(c ?? ""))).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeTitle = (form.title || `form-${form.id}`).replace(
      /[^a-z0-9-_]+/gi,
      "-"
    );
    a.href = url;
    a.download = `${safeTitle}-responses.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [form, responses, orderedFieldIds, fieldLabels, formatValue]);

  const respondentName = currentResponse
    ? currentResponse.user?.name ??
    (sidsToUserMap[currentResponse.sid ?? ""]
      ? "anonymous invited by " +
      sidsToUserMap[currentResponse.sid ?? ""]?.displayName
      : "anonymous")
    : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {form?.title ?? "Form Responses"}
                </h1>
                <p className="text-sm text-gray-500">
                  {total} response{total === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <Button
                  onClick={() => updateParams({ tab: "responses" })}
                  color={
                    tab === "responses" ? ButtonColor.Black : ButtonColor.White
                  }
                  size="small"
                >
                  Responses
                </Button>
                <Button
                  onClick={() => updateParams({ tab: "stats" })}
                  color={
                    tab === "stats" ? ButtonColor.Black : ButtonColor.White
                  }
                  size="small"
                  disabled={tab === "stats"}
                >
                  Stats
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={loadData} color={ButtonColor.White} size="small">
                Refresh
              </Button>
              <Button
                onClick={handleExportCsv}
                disabled={responses.length === 0}
                color={ButtonColor.Black}
                size="small"
              >
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {tab === "responses" && (
        <div className="px-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading responses...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredTotal === 0 ? (
            <Card style={CardStyle.White} className="flex items-center gap-3">
              <p className="text-gray-600">{emptyStateMessage}</p>
              {filterSummary && (
                <Button
                  onClick={clearFilter}
                  color={ButtonColor.White}
                  size="small"
                >
                  Clear filter
                </Button>
              )}
            </Card>
          ) : (
            <>
              {/* Response Navigator */}
              <div className="sticky top-[90px] z-20 bg-white rounded-lg border border-gray-200 p-4 mb-6">
                {filterSummary && (
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="text-sm text-gray-600">
                      Filtered:{" "}
                      <span className="font-medium text-gray-900">
                        {filterSummary.fieldLabel}
                      </span>{" "}
                      — {filterSummary.description}{" "}
                      <span className="text-gray-400">
                        ({filteredTotal} of {total})
                      </span>
                    </div>
                    <Button
                      onClick={clearFilter}
                      color={ButtonColor.White}
                      size="small"
                    >
                      Clear filter
                    </Button>
                  </div>
                )}
                <div className="flex items-center justify-between flex-wrap md:flex-nowrap">
                  {/* Pagination Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      disabled={page <= 1}
                      onClick={() => setPage(1)}
                      color={ButtonColor.Black}
                      size="small"
                    >
                      First
                    </Button>
                    <Button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      color={ButtonColor.Black}
                      size="small"
                    >
                      &larr; Prev
                    </Button>
                    <div className="px-4 py-1.5 text-sm font-medium text-gray-700 min-w-[100px] text-center">
                      {page} of {totalPages}
                    </div>
                    <Button
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      color={ButtonColor.Black}
                      size="small"
                    >
                      Next &rarr;
                    </Button>
                    <Button
                      disabled={page >= totalPages}
                      onClick={() => setPage(totalPages)}
                      color={ButtonColor.Black}
                      size="small"
                    >
                      Last
                    </Button>
                  </div>

                  {/* Response Info - Fixed width to prevent layout shift */}
                  {currentResponse && (
                    <div className="flex items-center gap-4">
                      <div className="text-right min-w-[200px]">
                        <p className="font-medium text-gray-900 truncate max-w-[700px]">
                          {respondentName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(currentResponse.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {currentResponse.sessionReplayUrl && (
                        <Button
                          size="small"
                          color={ButtonColor.BlueOutline}
                          onClick={() =>
                            window.open(
                              "https://us.posthog.com/project/188181/replay/home?sessionRecordingId=" +
                              currentResponse.sessionReplayUrl!.substring(
                                currentResponse.sessionReplayUrl!.lastIndexOf(
                                  "/"
                                ) + 1
                              ),
                              "_blank"
                            )
                          }
                        >
                          <CirclePlay size={14} className="mr-1.5" />
                          Replay
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Response */}
              {form !== null && (
                <div className="max-w-[600px] mx-auto">
                  {(() => {
                    const responseSchema =
                      (currentResponse?.schemaSnapshot as unknown as FormSchema) ??
                      form.schema;
                    return (
                      <div className="bg-white p-6 border border-gray-200 rounded-lg">
                        <FormRenderer
                          id={form.id}
                          actionId={0}
                          form={responseSchema}
                          completedFormResponse={currentResponse}
                          renderFormAsCompleted
                          onSubmit={null}
                          userId={currentResponse?.user?.id}
                          user={currentResponse?.user ?? undefined}
                          disableOptionRandomization
                        />
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      )}
      {tab === "stats" && (
        <FormResponseStatistics
          form={form}
          responses={responses}
          onFilterSelect={handleStatFilter}
        />
      )}
    </div>
  );
};

export default FormResponses;
