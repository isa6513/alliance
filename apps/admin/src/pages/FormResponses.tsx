import {
  tasksGetForm,
  tasksGetFormResponses,
  User,
  type FormDto,
  type TasksGetFormResponsesResponse,
} from "@alliance/shared/client";
import type { FormSchema, Page } from "@alliance/shared/forms/formschema";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

type FormWithSchema = Pick<FormDto, "id" | "title"> & {
  schema: FormSchema<string, string>;
  pages?: Page<string>[];
};

// The generated client type may not include id/user; account for it at runtime
type ResponseItem = (TasksGetFormResponsesResponse extends Array<infer U>
  ? U
  : never) & {
  id?: number;
  user?: User;
};

const PAGE_SIZE = 1; // show one response per page (step-through)

const FormResponses: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormWithSchema | null>(null);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const numericFormId = useMemo(
    () => (formId ? Number(formId) : NaN),
    [formId]
  );

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
      setResponses((respRes.data ?? []) as unknown as ResponseItem[]);
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

  useEffect(() => {
    // Keep current page in range when responses length changes
    const totalPages = Math.max(1, Math.ceil(responses.length / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
  }, [responses, page]);

  const total = responses.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const pageItems = responses.slice(startIdx, startIdx + PAGE_SIZE);

  const fieldLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    const schema = form?.schema as unknown as {
      pages?: Array<{
        fields?: Array<{ id?: string; label?: string; kind?: string }>;
      }>;
    };
    schema?.pages?.forEach((p) => {
      p.fields?.forEach((f) => {
        if (f && typeof f === "object" && "kind" in f && f.id && f.label) {
          labels[f.id] = f.label;
        }
      });
    });
    return labels;
  }, [form]);

  const formatValue = (v: unknown): string => {
    if (v == null) return "";
    if (Array.isArray(v)) return v.map((x) => formatValue(x)).join(", ");
    if (typeof v === "object") {
      // display file object nicely if present
      const o = v as any;
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
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {form?.title ? `Responses: ${form.title}` : "Form Responses"}
          </h2>
          <p className="text-sm text-gray-500">
            {total} total response{total === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/forms")}
            className="px-3 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200"
          >
            Back to Forms
          </button>
          <button
            onClick={loadData}
            className="px-3 py-2 rounded-md text-sm bg-green-600 text-white hover:bg-green-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading responses...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : total === 0 ? (
        <Card style={CardStyle.White}>
          <p className="text-gray-600">No responses yet for this form.</p>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Response {startIdx + 1} of {total}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-2 rounded-md text-sm ${
                  page <= 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={`px-3 py-2 rounded-md text-sm ${
                  page >= totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Next
              </button>
            </div>
          </div>

          {pageItems.map((resp) => (
            <Card key={resp.id ?? startIdx} style={CardStyle.White}>
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-gray-500">
                  {resp.id ? <span>ID: {resp.id}</span> : null}
                </div>
                {resp.user ? (
                  <div className="text-sm text-gray-600">
                    {resp.user?.name || "User"}
                    {resp.user?.id ? ` · #${resp.user.id}` : ""}
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(resp?.answers ?? {}).map(([key, value]) => (
                  <div key={key} className="border rounded-md p-3 bg-gray-50">
                    <div className="text-xs font-medium text-gray-600">
                      {fieldLabels[key] || key}
                    </div>
                    <div className="text-sm text-gray-900 break-words">
                      {formatValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

export default FormResponses;
