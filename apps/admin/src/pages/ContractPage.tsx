import {
  ContractAdminDto,
  contractCreate,
  contractFindOneAdmin,
  contractUpdate,
  CreateContractDto,
  UpdateContractDto,
} from "@alliance/shared/client";
import AppMarkdownWrapper from "@alliance/sharedweb/ui/AppMarkdownWrapper";
import FormTextarea from "../components/FormTextarea";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";

type ContractForm = {
  name: string;
  markdown: string;
  startDate: string;
  endDate: string;
};

const emptyForm: ContractForm = {
  name: "",
  markdown: "",
  startDate: "",
  endDate: "",
};

const ContractPage: React.FC = () => {
  const { id: idParam } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isNew = !idParam || idParam === "new";
  const id = !isNew && idParam ? parseInt(idParam, 10) : null;

  const [contract, setContract] = useState<ContractAdminDto | null>(null);
  const [loading, setLoading] = useState<boolean>(!isNew);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ContractForm>(emptyForm);
  const { success } = useToast();

  useEffect(() => {
    if (isNew || id == null || isNaN(id)) {
      if (!isNew && idParam) setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const response = await contractFindOneAdmin({
          path: { id },
        });
        if (cancelled) return;
        const data = response.data;
        if (!data) {
          setError("Contract not found");
          setLoading(false);
          return;
        }
        setContract(data);
        setForm({
          name: data.name ?? "",
          markdown: data.markdown,
          startDate: data.startDate
            ? new Date(data.startDate).toISOString().slice(0, 16)
            : "",
          endDate: data.endDate
            ? new Date(data.endDate).toISOString().slice(0, 16)
            : "",
        });
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load contract");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, isNew, idParam]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError(null);
      try {
        if (isNew) {
          const body: CreateContractDto = {
            name: form.name.trim(),
            markdown: form.markdown,
            startDate: form.startDate
              ? new Date(form.startDate).toISOString()
              : null,
            endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
          };
          const response = await contractCreate({
            body,
          });
          if (!response.data) throw new Error("Failed to create");
          navigate(`/contracts/${response.data.id}`);
        } else if (id != null) {
          const body: UpdateContractDto = {
            name: form.name.trim(),
            startDate: form.startDate
              ? new Date(form.startDate).toISOString()
              : null,
            endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
          };
          const response = await contractUpdate({
            path: { id },
            body,
          });
          if (response.data) setContract(response.data);
          else throw new Error("Update failed");
          success("Contract updated successfully");
        }
      } catch (err) {
        setError("Failed to save contract");
        console.error(err);
      } finally {
        setSaving(false);
      }
    },
    [isNew, id, form, navigate, success]
  );

  if (loading) {
    return (
      <div className="p-8">
        <title>Contract - Admin</title>
        Loading contract...
      </div>
    );
  }

  if (error && !contract && !isNew) {
    return (
      <div className="p-8">
        <title>Contract - Admin</title>
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate("/contracts")}
          className="mt-4 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>
    );
  }

  const pageTitle = isNew
    ? "Create Contract"
    : contract
    ? contract.name?.trim() || `Contract #${contract.id}`
    : "Contract";

  return (
    <div className="flex flex-col h-full">
      <title>{pageTitle} - Admin</title>
      <div className="p-5 pb-0 flex flex-row justify-between w-full">
        <h1 className="text-[#111] text-[16pt] font-bold">{pageTitle}</h1>
        <button
          onClick={() => navigate("/contracts")}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 text-nowrap mr-5"
        >
          ← Back to Contracts
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-5 mt-4">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 mx-5 overflow-y-auto pb-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-sm font-semibold text-gray-900">Details</h3>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={`Contract #${contract?.id ?? "—"}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="markdown"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Content
                </label>
                {isNew && (
                  <FormTextarea
                    id="markdown"
                    value={form.markdown}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, markdown: e.target.value }))
                    }
                    minRows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-mono"
                  />
                )}
                {isNew && form.markdown && (
                  <p className="text-xs text-gray-500 mt-0.5">Preview:</p>
                )}
                {form.markdown && (
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-md max-h-96 overflow-y-auto">
                    <AppMarkdownWrapper markdownContent={form.markdown} />
                  </div>
                )}
              </div>
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Start Date
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        id="startDate"
                        value={form.startDate}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                      />
                      {form.startDate && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, startDate: "" }))
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 text-sm font-medium shrink-0"
                          title="Clear start date"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      End Date
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        id="endDate"
                        value={form.endDate}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                      />
                      {form.endDate && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, endDate: "" }))
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 text-sm font-medium shrink-0"
                          title="Clear end date"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/contracts")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 mr-3 bg-green text-white rounded-md hover:scale-102 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green focus:ring-offset-2 text-sm font-medium"
              disabled={saving}
            >
              {saving
                ? isNew
                  ? "Creating..."
                  : "Saving..."
                : isNew
                ? "Create Contract"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractPage;
