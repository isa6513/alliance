import {
  ActionSuite,
  actionsCreateGeneralUpdate,
  actionsSuites,
  CreateGeneralUpdateDto,
  TagDto,
  userGetTags,
  userMembers,
} from "@alliance/shared/client";
import UserSelect, { UserSelectUser } from "@alliance/sharedweb/ui/UserSelect";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

const FormSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="border border-gray-200 rounded-lg bg-white">
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

type GeneralUpdateForm = {
  name: string;
  startDate: string;
  endDate: string;
  useManualCohort: boolean;
  manualCohortUserIds: number[];
  tagIds: string[];
  suiteIds: number[];
};

const emptyForm: GeneralUpdateForm = {
  name: "",
  startDate: "",
  endDate: "",
  useManualCohort: false,
  manualCohortUserIds: [],
  tagIds: [],
  suiteIds: [],
};

const GeneralUpdateDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<GeneralUpdateForm>(emptyForm);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [availableTags, setAvailableTags] = useState<TagDto[]>([]);
  const [tagsLoading, setTagsLoading] = useState<boolean>(true);
  const [availableSuites, setAvailableSuites] = useState<ActionSuite[]>([]);
  const [suitesLoading, setSuitesLoading] = useState<boolean>(true);
  const [availableUsers, setAvailableUsers] = useState<UserSelectUser[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);

  // Load tags
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await userGetTags();
        if (!cancelled && response.data) setAvailableTags(response.data);
      } catch (err) {
        console.error("Failed to load tags:", err);
      } finally {
        if (!cancelled) setTagsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load suites
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await actionsSuites();
        if (!cancelled && response.data) setAvailableSuites(response.data);
      } catch (err) {
        console.error("Failed to load suites:", err);
      } finally {
        if (!cancelled) setSuitesLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load users
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await userMembers();
        if (!cancelled && response.data) {
          setAvailableUsers(
            response.data.map<UserSelectUser>((user) => ({
              id: user.id,
              name: user.displayName,
              profilePicture: user.profilePicture,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasSuites = form.suiteIds.length > 0;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError(null);

      try {
        const body: CreateGeneralUpdateDto = {
          name: form.name,
          startDate:
            !hasSuites && form.startDate
              ? new Date(form.startDate).toISOString()
              : undefined,
          endDate:
            !hasSuites && form.endDate
              ? new Date(form.endDate).toISOString()
              : undefined,
          useManualCohort: form.useManualCohort,
          manualCohortUserIds: form.useManualCohort
            ? form.manualCohortUserIds
            : [],
          tagIds: form.tagIds,
          suiteIds: form.suiteIds,
        };

        const response = await actionsCreateGeneralUpdate({ body });
        if (!response.data) {
          throw new Error("Failed to create");
        }
        navigate(`/general-updates/${response.data.id}`);

        setSaving(false);
      } catch (err) {
        setError("Failed to save general update");
        setSaving(false);
        console.error(err);
      }
    },
    [form, navigate, hasSuites]
  );

  const handleToggleTag = useCallback((tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  }, []);

  const handleToggleSuite = useCallback((suiteId: number) => {
    setForm((prev) => ({
      ...prev,
      suiteIds: prev.suiteIds.includes(suiteId)
        ? prev.suiteIds.filter((id) => id !== suiteId)
        : [...prev.suiteIds, suiteId],
    }));
  }, []);

  const handleManualCohortChange = useCallback((ids: number[]) => {
    setForm((prev) => ({
      ...prev,
      manualCohortUserIds: ids,
    }));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <title>{"Create General Update"} - Admin</title>
      <div className="p-5 pb-0 flex flex-row justify-between w-full">
        <h1 className="text-[#111] text-[16pt] font-bold">
          {"Create General Update"}
        </h1>
        <button
          onClick={() => navigate("/general-updates")}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 text-nowrap mr-5"
        >
          ← Back
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-5 mt-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 p-5 pb-6">
        {/* NAME */}
        <FormSection title="Content">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <textarea
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                rows={1}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              />
            </div>
          </div>
        </FormSection>

        {/* SUITES */}
        <FormSection
          title="Suites"
          description="Assign this general update to one or more suites. When assigned to a suite, the start and end dates are inherited from the suite schedule."
        >
          <div className="space-y-3">
            {suitesLoading ? (
              <p className="text-sm text-gray-500">Loading suites...</p>
            ) : availableSuites.length ? (
              <div className="grid gap-2 sm:grid-cols-3">
                {availableSuites.map((suite) => {
                  const checked = form.suiteIds.includes(suite.id);
                  return (
                    <label
                      key={suite.id}
                      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                        checked
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={checked}
                        onChange={() => handleToggleSuite(suite.id)}
                      />
                      <span className="font-medium text-gray-800">
                        {suite.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No suites available.</p>
            )}
          </div>
        </FormSection>

        {/* DATE FIELDS - only when no suite is assigned */}
        {!hasSuites && (
          <FormSection
            title="Schedule"
            description="Set start and end dates manually when not using a suite."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Date
                </label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Date
                </label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                />
              </div>
            </div>
          </FormSection>
        )}

        {/* TARGETING */}
        <FormSection title="Participating Users">
          <div className="space-y-6">
            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Participating Tags
                </label>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Updates without tags will not be shown to any users, unless
                Manual User Cohort is enabled.
              </p>
              {tagsLoading ? (
                <p className="text-sm text-gray-500">Loading tags...</p>
              ) : availableTags.length ? (
                <div className="grid gap-2 sm:grid-cols-4">
                  {availableTags.map((tag) => {
                    const checked = form.tagIds.includes(tag.id);
                    return (
                      <label
                        key={tag.id}
                        className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                          checked
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={checked}
                          onChange={() => handleToggleTag(tag.id)}
                        />
                        <span className="flex flex-col min-w-0">
                          <span className="font-medium text-gray-800">
                            {tag.name}
                          </span>
                          {tag.publicDisplayName && (
                            <span className="text-xs text-gray-500">
                              {tag.publicDisplayName}
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No tags available. Create one in the tags dashboard.
                </p>
              )}
            </div>

            {/* Manual Cohort */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Manual User Cohort{" "}
                  {form.useManualCohort
                    ? `(${form.manualCohortUserIds.length})`
                    : ""}
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.useManualCohort}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        useManualCohort: e.target.checked,
                        manualCohortUserIds: e.target.checked
                          ? prev.manualCohortUserIds
                          : [],
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Enable</span>
                </label>
              </div>
              {form.useManualCohort ? (
                <UserSelect
                  users={availableUsers}
                  selectedUserIds={form.manualCohortUserIds}
                  onChange={handleManualCohortChange}
                  loading={usersLoading}
                  label="Select users"
                />
              ) : (
                <p className="text-xs text-gray-500">
                  Enable to manually select specific users for this update.
                </p>
              )}
            </div>
          </div>
        </FormSection>

        {/* SUBMIT */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/general-updates")}
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
            {saving ? "Creating..." : "Create General Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralUpdateDashboard;
