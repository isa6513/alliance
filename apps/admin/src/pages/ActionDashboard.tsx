import {
  ActionDto,
  actionsCreate,
  actionsFindOne,
  actionsRemove,
  actionsUpdate,
  CreateActionDto,
  FormDto,
  tasksListForms,
  userGetGroups,
} from "@alliance/shared/client";
import type { Group, GroupDto } from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import DatabaseIcon from "@alliance/shared/ui/icons/DatabaseIcon";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import ActionForm from "../components/ActionForm";
import EventManagementTab from "../components/EventManagementTab";
import { getApiUrl } from "../lib/config";

// Status color mapping
export const getStatusColor = (status: ActionDto["status"]) => {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "upcoming":
      return "bg-blue-100 text-blue-800";
    case "gathering_commitments":
      return "bg-yellow-100 text-yellow-800";
    case "office_action":
      return "bg-orange-100 text-orange-800";
    case "member_action":
      return "bg-purple-100 text-purple-800";
    case "resolution":
      return "bg-indigo-100 text-indigo-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "abandoned":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Format status for display
export const formatStatus = (status: string) => {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

type Tab = "overview" | "details" | "events";

const ActionDashboard: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const navigate = useNavigate();
  const isNew = actionId === "new";
  const [action, setAction] = useState<ActionDto | null>(null);
  const [loading, setLoading] = useState<boolean>(!isNew);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [availableForms, setAvailableForms] = useState<FormDto[]>([]);
  const [formsLoading, setFormsLoading] = useState<boolean>(true);
  const [availableGroups, setAvailableGroups] = useState<GroupDto[]>([]);
  const [groupsLoading, setGroupsLoading] = useState<boolean>(true);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "overview"
  );

  useEffect(() => {
    setSearchParams((prev) => {
      prev.set("tab", activeTab);
      return prev;
    });
  }, [activeTab, setSearchParams, searchParams]);

  // Load available forms on component mount
  useEffect(() => {
    const loadForms = async () => {
      try {
        const response = await tasksListForms();
        if (response.data) {
          setAvailableForms(response.data);
        }
        setFormsLoading(false);
      } catch (err) {
        console.error("Failed to load forms:", err);
        setFormsLoading(false);
      }
    };
    loadForms();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadGroups = async () => {
      try {
        const response = await userGetGroups();
        if (!cancelled && response.data) {
          setAvailableGroups(response.data);
        }
      } catch (err) {
        console.error("Failed to load groups:", err);
      } finally {
        if (!cancelled) {
          setGroupsLoading(false);
        }
      }
    };

    loadGroups();

    return () => {
      cancelled = true;
    };
  }, []);

  const [form, setForm] = useState<CreateActionDto & { taskFormId?: number }>({
    name: "",
    category: "",
    image: "",
    body: "",
    timeEstimate: 0,
    shortDescription: "",
    commitmentless: false,
    type: "Activity",
    taskFormId: undefined,
    participatingGroups: [],
  });

  // Reset form when switching to new action mode
  useEffect(() => {
    if (isNew) {
      setForm({
        name: "",
        category: "",
        image: "",
        body: "",
        timeEstimate: 0,
        shortDescription: "",
        commitmentless: false,
        type: "Activity",
        taskFormId: undefined,
        participatingGroups: [],
      });
      setImageFile(null);
      setImagePreview(null);
      setError(null);
      setSelectedGroupIds([]);
    }
  }, [isNew]);

  useEffect(() => {
    if (isNew || !actionId) {
      return;
    }

    const loadAction = async () => {
      try {
        const response = await actionsFindOne({
          path: { id: parseInt(actionId) },
        });
        const actionData = response.data;
        if (!actionData) {
          throw new Error("Action not found");
        }
        setAction(actionData);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { activities, usersCompleted, usersJoined, events, ...formData } =
          actionData;

        setForm({
          ...formData,
          taskFormId: actionData.taskFormId,
          participatingGroups: actionData.participatingGroups ?? [],
        });

        setSelectedGroupIds(
          (actionData.participatingGroups || []).map((group) => group.id)
        );

        setLoading(false);
      } catch (err) {
        setError("Failed to load action");
        setLoading(false);
        console.error(err);
      }
    };

    loadAction();
  }, [actionId, isNew]);

  const handleActionCreated = useCallback(
    (action: ActionDto) => {
      navigate(`/actions/${action.id}`);
    },
    [navigate]
  );

  const handleActionDeleted = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
      return;
    }

    // Handle numeric fields
    if (
      name === "commitmentThreshold" ||
      name === "donationThreshold" ||
      name === "donationAmount"
    ) {
      const numValue = value === "" ? null : parseFloat(value);
      setForm((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setForm((prev) => {
        const newForm = {
          ...prev,
          [name]: value,
        };

        if (name === "type" && value === "Funding") {
          newForm.taskFormId = undefined;
        }

        return newForm;
      });
    }
  };

  const handleGroupsChange = useCallback(
    (ids: number[]) => {
      setSelectedGroupIds(ids);
      setForm((prev) => ({
        ...prev,
        participatingGroups: ids.map(
          (id) => ({ id } as unknown as Group)
        ),
      }));
    },
    []
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  //   const uploadImage = async (): Promise<string | null> => {
  //     if (!imageFile) return null;

  //     try {
  //       setUploadingImage(true);
  //       setError(null);

  //       const response = await imagesUploadImage({
  //         body: { image: imageFile },
  //       });

  //       if (!response.data) {
  //         throw new Error("Failed to upload image");
  //       }
  //       return response.data;
  //     } catch (err) {
  //       console.error("Error uploading image:", err);
  //       setError("Failed to upload image. Please try again.");
  //       return null;
  //     } finally {
  //       setUploadingImage(false);
  //     }
  //   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      //   const imageFilename = null;
      //   if (imageFile) {
      //     imageFilename = await uploadImage();
      //     if (!imageFilename) {
      //       throw new Error("Failed to upload image");
      //     }
      //   }

      const formData = {
        ...form,
        participatingGroups: selectedGroupIds.map(
          (id) => ({ id } as unknown as Group)
        ),
        // ...(imageFilename && { image: imageFilename }),
      };

      if (isNew) {
        const response = await actionsCreate({
          body: formData,
        });
        const newAction = response.data;
        if (!newAction) {
          throw new Error("Failed to create action");
        }

        handleActionCreated(newAction);
      } else if (actionId) {
        const response = await actionsUpdate({
          path: { id: parseInt(actionId) },
          body: formData,
        });
        const updatedAction = response.data;
        if (!updatedAction) {
          throw new Error("Failed to update action");
        }
        // Reload the action to get updated data
        const reloadResponse = await actionsFindOne({
          path: { id: parseInt(actionId) },
        });
        if (reloadResponse.data) {
          setAction(reloadResponse.data);
        }
      }
      setSaving(false);
    } catch (err) {
      setError("Failed to save action");
      setSaving(false);
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (isNew || !actionId) return;

    if (
      window.confirm(
        "Are you sure you want to delete this action? This cannot be undone."
      )
    ) {
      try {
        setLoading(true);
        const response = await actionsRemove({
          path: { id: parseInt(actionId) },
        });
        if (response.error) {
          throw new Error("Failed to delete action");
        }
        handleActionDeleted();
      } catch (err) {
        setError("Failed to delete action");
        setLoading(false);
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="p-8">Loading action...</div>;
  }

  const baseUrl = getApiUrl();

  const tabData: { key: Tab; label: string }[] = [
    { key: "overview", label: "Status Overview" },
    { key: "details", label: "Action Details" },
    { key: "events", label: "Event Management" },
  ];

  return (
    <div className="flex flex-col h-full p-5">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[#111] text-[16pt] font-bold">
          {isNew ? "Create New Action" : `Action: ${action?.name}`}
        </h1>
        <button
          onClick={handleCancel}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 text-nowrap"
        >
          ← Back
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isNew ? (
        // New Action Creation Form
        <ActionForm
          form={form}
          onInputChange={handleInputChange}
          onImageChange={handleImageChange}
          onSubmit={handleSubmit}
          saving={saving}
          uploadingImage={uploadingImage}
          imagePreview={imagePreview}
          isNew={true}
          onCancel={handleCancel}
          availableForms={availableForms}
          formsLoading={formsLoading}
          availableGroups={availableGroups}
          groupsLoading={groupsLoading}
          selectedGroupIds={selectedGroupIds}
          onGroupsChange={handleGroupsChange}
        />
      ) : (
        // Existing Action Dashboard
        <div className="space-y-4 flex-1 min-h-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabData.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 text-sm ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <a
                href={
                  window.location.origin.includes("localhost")
                    ? `http://localhost:5173/actions/${action?.id}`
                    : `https://worldalliance.org/actions/${action?.id}`
                }
                target="_blank"
                rel="noreferrer"
                className={`py-2 px-1 border-b-2 font-medium text-sm ${"border-transparent text-blue-500 hover:text-blue-600 hover:border-blue-300"}`}
              >
                View Action Page →
              </a>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "overview" && action && (
              <div className="space-y-4">
                {/* Current Status */}
                <div className="flex flex-row gap-x-2">
                  <Button
                    onClick={() =>
                      window.open(
                        `/database?table=action&id=${action.id}`,
                        "_blank"
                      )
                    }
                    color={ButtonColor.White}
                    className="!px-3 !text-sm gap-x-1"
                  >
                    <DatabaseIcon size="large" />
                    Edit in Database
                  </Button>
                </div>
                <Card style={CardStyle.White}>
                  <h2 className="text-lg font-semibold mb-0">
                    Current Status:{" "}
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full cursor-pointer text-[14px] font-normal ${getStatusColor(
                        action.status
                      )}`}
                      onClick={() => {
                        setActiveTab("events");
                      }}
                    >
                      {formatStatus(action.status)}
                    </span>
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        <strong>Users Joined:</strong> {action.usersJoined}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Users Completed:</strong>{" "}
                        {action.usersCompleted}
                      </div>
                      {action.type === "Funding" && (
                        <>
                          {action.donationAmount && (
                            <div className="text-sm text-gray-600">
                              <strong>Suggested Donation:</strong> $
                              {action.donationAmount / 100}
                            </div>
                          )}
                        </>
                      )}
                      {action.commitmentThreshold && (
                        <div className="text-sm text-gray-600">
                          <strong>Commitment Threshold:</strong>{" "}
                          {action.commitmentThreshold}
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        <strong>Action ID:</strong> {action.id}
                      </div>
                    </div>

                    {action.image && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Action Image:
                        </p>
                        <img
                          src={action.image}
                          alt={action.name}
                          className="w-full max-w-sm h-auto rounded-md border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </Card>

                {/* Events Timeline */}
                <Card style={CardStyle.White}>
                  <h2 className="text-lg font-semibold mb-4">
                    Status Timeline
                  </h2>
                  <div className="space-y-3">
                    {action.events && action.events.length > 0 ? (
                      action.events
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                        )
                        .map((event, index) => (
                          <div
                            key={event.id}
                            className="flex items-center space-x-3"
                          >
                            <div className="flex-shrink-0">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  index === 0 ? "bg-blue-500" : "bg-gray-300"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm">
                                <span className="">{event.title}</span>
                                <span
                                  className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs ${getStatusColor(
                                    event.newStatus
                                  )}`}
                                >
                                  {formatStatus(event.newStatus)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(event.date).toLocaleString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZoneName: "short",
                                  }
                                )}
                              </div>
                              {event.description && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {event.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-sm text-gray-500">
                        No events yet. This action is in Draft status by
                        default.
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "details" && (
              <Card style={CardStyle.Grey}>
                <ActionForm
                  form={form}
                  onInputChange={handleInputChange}
                  onImageChange={handleImageChange}
                  onSubmit={handleSubmit}
                  saving={saving}
                  uploadingImage={uploadingImage}
                  imagePreview={imagePreview}
                  isNew={false}
                  onDelete={handleDelete}
                  baseUrl={baseUrl}
                  availableForms={availableForms}
                  formsLoading={formsLoading}
                  availableGroups={availableGroups}
                  groupsLoading={groupsLoading}
                  selectedGroupIds={selectedGroupIds}
                  onGroupsChange={handleGroupsChange}
                />
              </Card>
            )}

            {activeTab === "events" && action && (
              <EventManagementTab action={action} setAction={setAction} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionDashboard;
