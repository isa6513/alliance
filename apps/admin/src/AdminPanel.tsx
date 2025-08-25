import {
  ActionDto,
  actionsAddEvent,
  actionsClearDb,
  actionsCreate,
  actionsFindAllWithDrafts,
  actionsSetTestRelations,
  tasksListForms,
} from "@alliance/shared/client";
import { FormSchema, Page } from "@alliance/shared/forms/formschema";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ActionDashboard from "./ActionDashboard";
import { useAuth } from "./AuthContext";
import Card, { CardStyle } from "./Card";
import ActionProgressBar from "./components/ActionProgressBar";
import ActionTimeline from "./components/ActionTimeline";
import ConfirmDialog from "./components/ConfirmDialog";
import { FormBuilder } from "./components/FormBuilder";
import UserList from "./components/UserList";
import { testActions } from "./testData";

export interface Form {
  id: number;
  title: string;
  schema: FormSchema<string, string>;
  pages: Page<string>[];
}

const AdminPanel: React.FC = () => {
  const [actions, setActions] = useState<ActionDto[]>([]);
  const [actionsLoading, setActionsLoading] = useState<boolean>(true);
  const [forms, setForms] = useState<Form[]>([]);
  const [formsLoading, setFormsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopulateConfirm, setShowPopulateConfirm] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { logout, user, loading: authLoading } = useAuth();

  // Get current view state from URL params
  const selectedActionId = searchParams.get("action");
  const isCreatingNew = searchParams.get("new") === "true";
  const selectedFormId = searchParams.get("form");
  const isCreatingNewForm = searchParams.get("newForm") === "true";
  const viewMode = searchParams.get("view") || "list"; // "list", "timeline", "forms"

  // Only check admin status after loading is complete and we have a user
  useEffect(() => {
    if (!authLoading && user && !user.admin) {
      logout();
    }
  }, [authLoading, user, logout]);

  const loadActions = useCallback(async () => {
    try {
      const response = await actionsFindAllWithDrafts();
      if (response.data) {
        setActions(response.data);
      }
      setActionsLoading(false);
    } catch (err) {
      setError("Failed to load actions");
      setActionsLoading(false);
      console.error(err);
    }
  }, []);

  const loadForms = useCallback(async () => {
    try {
      const response = await tasksListForms();
      if (response.data) {
        setForms(response.data as unknown as Form[]);
      }
      setFormsLoading(false);
    } catch (err) {
      setError("Failed to load forms");
      setFormsLoading(false);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadActions();
    loadForms();
  }, [loadActions, loadForms]);

  const handleCreateAction = useCallback(() => {
    setSearchParams({ new: "true" });
  }, [setSearchParams]);

  const handleEditAction = useCallback(
    (id: number) => {
      setSearchParams({ action: id.toString() });
    },
    [setSearchParams]
  );

  const handleBackToList = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const handleActionCreated = useCallback(
    (action: ActionDto) => {
      setSearchParams({ action: action.id.toString() });
      loadActions(); // Refresh the list
    },
    [setSearchParams, loadActions]
  );

  const handleActionUpdated = useCallback(() => {
    loadActions(); // Refresh the list
  }, [loadActions]);

  const handleActionDeleted = useCallback(() => {
    setSearchParams({});
    loadActions(); // Refresh the list
  }, [setSearchParams, loadActions]);

  const handleCreateForm = useCallback(() => {
    setSearchParams({ newForm: "true", view: "forms" });
  }, [setSearchParams]);

  const handleEditForm = useCallback(
    (id: number) => {
      setSearchParams({ form: id.toString(), view: "forms" });
    },
    [setSearchParams]
  );

  const handleFormSaved = useCallback(() => {
    loadForms(); // Refresh the forms list
  }, [loadForms]);

  const handleViewModeChange = useCallback(
    (mode: string) => {
      const params = new URLSearchParams(searchParams);
      if (mode === "list") {
        params.delete("view");
      } else {
        params.set("view", mode);
      }
      if (mode === "users") {
        params.delete("tab");
        params.delete("action");
        params.delete("form");
        params.delete("newForm");
      }
      if (mode === "forms") {
        params.delete("action");
        params.delete("new");
      }
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handlePopulateTestData = useCallback(async () => {
    setIsPopulating(true);
    try {
      await actionsClearDb();
      // Create each test action using the existing endpoint
      for (let i = 0; i < testActions.length; i++) {
        const testAction = testActions[i];
        const response = await actionsCreate({ body: { ...testAction } });

        if (response.data?.id) {
          await actionsAddEvent({
            path: { id: response.data.id },
            body: {
              title: "Action Launch",
              description:
                "Action is now live and gathering commitments from the community.",
              newStatus: "gathering_commitments",
              date: new Date(Date.now() - 86400000).toISOString(),
              showInTimeline: true,
              sendNotifsTo: "all",
            },
          });
          if (i % 2 === 0) {
            await actionsAddEvent({
              path: { id: response.data.id },
              body: {
                title: "Commitments Reached",
                description: "Enough people have committed! Time for action.",
                newStatus: "member_action",
                date: new Date(Date.now() - 26400000).toISOString(),
                showInTimeline: true,
                sendNotifsTo: "joined",
              },
            });
          }
        }
      }
      await loadActions();
      await actionsSetTestRelations();
    } catch (err) {
      setError("Failed to populate test data");
      console.error(err);
    } finally {
      setIsPopulating(false);
      setShowPopulateConfirm(false);
    }
  }, [loadActions]);

  return (
    <div className="flex flex-row min-h-screen h-fitcontent flex-nowrap bg-pagebg bg-[#fcfcfc]">
      <div className="overflow-y-auto max-h-screen overflow-x-hidden flex flex-col justify-between bg-[#f4f4f4]">
        <div className="flex flex-col gap-y-3 w-[320px] min-w-[320px] sticky p-5 py-6">
          <h1 className="text-black text-[14pt] font-bold pb-0">
            Alliance Admin
          </h1>
          <p className="font-bold">Tools</p>
          <div className="flex flex-col gap-y-2">
            <Link
              to="/database"
              className="w-full bg-blue-100 text-center hover:bg-blue-200/60 border border-blue-400 text-black px-4 py-2 rounded-md text-sm font-medium"
            >
              Database Viewer
            </Link>
            <button
              onClick={() => handleViewModeChange("forms")}
              className="w-full bg-green-100 hover:bg-green-200/60 border border-green-400 text-black px-4 py-2 rounded-md text-sm font-medium"
            >
              Forms
            </button>
            <button
              onClick={() => handleViewModeChange("users")}
              className="w-full bg-gray-100 hover:bg-gray-200/50 border border-gray-300 text-black px-4 py-2 rounded-md text-sm font-medium"
            >
              Users
            </button>
            <button
              onClick={() => setShowPopulateConfirm(true)}
              disabled={isPopulating}
              className="w-full bg-gray-100 hover:bg-gray-200/50 border border-gray-300 text-black px-4 py-2 rounded-md text-sm font-medium"
            >
              {isPopulating ? "Populating..." : "Populate Test Data"}
            </button>
          </div>
          <div className="flex flex-row justify-between items-center mt-3">
            <p className="font-bold">Current Actions</p>
            <button
              onClick={handleCreateAction}
              className="bg-green-3 hover:bg-green-2 text-white px-3 py-1 rounded-md text-sm font-medium"
            >
              Create
            </button>
          </div>
          <div className="flex flex-col gap-y-2">
            {actions.map((action) => (
              <div
                key={action.id}
                onClick={() => handleEditAction(action.id)}
                className="cursor-pointer hover:bg-stone-200 p-2 rounded-md"
              >
                <p className="text-sm">{action.name}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-row justify-between items-center p-3 px-5">
          <p className="text-sm text-gray-800">{user?.email}</p>
          <button
            className="bg-zinc-200 hover:bg-zinc-300 border border-zinc-300 text-[#222] px-3 py-1 rounded-md text-sm font-medium"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-scroll max-h-screen">
        <div className="flex flex-col gap-y-5 min-h-0 p-5 max-w-[calc(100vw-320px)] flex-1 h-fit">
          {selectedActionId || isCreatingNew ? (
            // Show Action Dashboard
            <div className="flex-1 min-h-0">
              <ActionDashboard
                actionId={selectedActionId || "new"}
                isNew={isCreatingNew}
                onActionCreated={handleActionCreated}
                onActionUpdated={handleActionUpdated}
                onActionDeleted={handleActionDeleted}
                onCancel={handleBackToList}
              />
            </div>
          ) : selectedFormId || isCreatingNewForm ? (
            // Show Form Builder
            <FormBuilder
              onSave={handleFormSaved}
              actionId={93}
              formId={selectedFormId || undefined}
              key={selectedFormId || "new"}
            />
          ) : (
            <>
              {viewMode !== "forms" && viewMode !== "users" && (
                <div className="flex justify-end items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewModeChange("list")}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        viewMode === "list"
                          ? "bg-[#4678ed] text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => handleViewModeChange("timeline")}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        viewMode === "timeline"
                          ? "bg-[#4678ed] text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Timeline
                    </button>
                  </div>
                </div>
              )}

              {viewMode === "forms" ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Forms
                    </h2>
                    <button
                      onClick={handleCreateForm}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
                    >
                      Create New Form
                    </button>
                  </div>

                  {formsLoading ? (
                    <p>Loading forms...</p>
                  ) : forms.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No forms found.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {forms.map((form) => (
                        <Card key={form.id} style={CardStyle.White}>
                          <div
                            onClick={() => handleEditForm(form.id)}
                            className="cursor-pointer"
                          >
                            <div className="flex justify-between mb-2">
                              <h3 className="font-bold text-sm">
                                {form.title || `Form ${form.id}`}
                              </h3>
                              <span className="text-xs text-gray-500">
                                ID: {form.id}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {form.schema.pages?.length || 0} page
                              {(form.schema.pages?.length || 0) !== 1
                                ? "s"
                                : ""}{" "}
                              •
                              {form.schema.pages?.reduce(
                                (total: number, page) =>
                                  total + (page.fields?.length || 0),
                                0
                              ) || 0}{" "}
                              field
                              {(form.pages?.reduce(
                                (total: number, page) =>
                                  total + (page.fields?.length || 0),
                                0
                              ) || 0) !== 1
                                ? "s"
                                : ""}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : viewMode === "users" ? (
                <div className="flex-1 overflow-hidden h-full">
                  <UserList />
                </div>
              ) : actionsLoading ? (
                <p>Loading actions...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : actions.length === 0 ? (
                <p>No actions found.</p>
              ) : viewMode === "timeline" ? (
                <div className="flex-1 overflow-hidden h-full">
                  <ActionTimeline actions={actions} className="h-full" />
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto">
                  <p className="font-bold ml-2">Actions</p>
                  {actions.map((action) => (
                    <Card key={action.name} style={CardStyle.White}>
                      <div
                        onClick={() => handleEditAction(action.id)}
                        className="cursor-pointer relative"
                      >
                        <div className="flex justify-between mb-2 ">
                          <h2 className="font-bold text-sm">{action.name}</h2>
                          <span className="absolute p-2 right-0 top-0 bg-zinc-50 text-zinc-800 font-medium text-xs rounded-sm text-nowrap border-zinc-200 border">
                            {action.status}
                          </span>
                        </div>
                        <p className="text-xs">{action.shortDescription}</p>

                        <ActionProgressBar
                          status={action.status}
                          usersJoined={action.usersJoined}
                          usersCompleted={action.usersCompleted}
                          commitmentThreshold={action.commitmentThreshold}
                          actionType={action.type}
                          donationThreshold={action.donationThreshold}
                          donationAmount={action.donationAmount}
                          className="mt-2"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showPopulateConfirm && (
        <ConfirmDialog
          isOpen={showPopulateConfirm}
          onCancel={() => setShowPopulateConfirm(false)}
          onConfirm={handlePopulateTestData}
          title="Populate Test Data"
          message={`This will clear all existing action data and replace it with test actions. Are you sure you want to proceed?`}
          confirmText="Populate Data"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default AdminPanel;
