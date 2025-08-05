import React, { useCallback, useEffect, useState } from "react";
import Card, { CardStyle } from "./Card";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ActionDto,
  actionsFindAllWithDrafts,
  actionsCreate,
  actionsAddEvent,
  actionsClearDb,
  actionsSetTestRelations,
} from "@alliance/shared/client";
import { useAuth } from "./AuthContext";
import ActionDashboard from "./ActionDashboard";
import ActionProgressBar from "./components/ActionProgressBar";
import ActionTimeline from "./components/ActionTimeline";
import ConfirmDialog from "./components/ConfirmDialog";
import { testActions } from "./testData";

const AdminPanel: React.FC = () => {
  const [actions, setActions] = useState<ActionDto[]>([]);
  const [actionsLoading, setActionsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopulateConfirm, setShowPopulateConfirm] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { logout, user, loading: authLoading } = useAuth();

  // Get current view state from URL params
  const selectedActionId = searchParams.get("action");
  const isCreatingNew = searchParams.get("new") === "true";
  const viewMode = searchParams.get("view") || "list"; // "list" or "timeline"

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

  useEffect(() => {
    loadActions();
  }, [loadActions]);

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

  const handleViewModeChange = useCallback(
    (mode: string) => {
      const params = new URLSearchParams(searchParams);
      if (mode === "list") {
        params.delete("view");
      } else {
        params.set("view", mode);
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
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h1 className="text-[#111] text-[14pt] font-extrabold">
                  Actions
                </h1>
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

              {actionsLoading ? (
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
