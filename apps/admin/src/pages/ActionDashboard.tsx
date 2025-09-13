import {
  ActionDto,
  actionsAddEvent,
  actionsCreate,
  actionsEventNotifData,
  actionsFindOne,
  actionsRemove,
  ActionStatus,
  actionsUpdate,
  CreateActionDto,
  CreateActionEventDto,
  FormDto,
  PreEventNotifDataDto,
  tasksListForms,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import DatabaseIcon from "@alliance/shared/ui/icons/DatabaseIcon";
import DropdownIcon from "@alliance/shared/ui/icons/DropdownIcon";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import ActionForm from "../components/ActionForm";
import { getApiUrl } from "../lib/config";

// Status color mapping
const getStatusColor = (status: ActionDto["status"]) => {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "upcoming":
      return "bg-blue-100 text-blue-800";
    case "gathering_commitments":
      return "bg-yellow-100 text-yellow-800";
    case "commitments_reached":
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
const formatStatus = (status: string) => {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper function to format date for datetime-local input
const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Status options for event creation
const statusOptions: Record<ActionStatus, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  gathering_commitments: "Gathering Commitments",
  commitments_reached: "Commitments Reached",
  member_action: "Member Action",
  resolution: "Resolution",
  completed: "Completed",
  failed: "Failed",
  abandoned: "Abandoned",
};

const defaultEventNames: Record<ActionStatus, string> = {
  draft: "",
  gathering_commitments: "Gathering commitments",
  commitments_reached: "Pending office action",
  member_action: "Members taking action",
  resolution: "Pending office resolution",
  completed: "Action successful",
  failed: "Action failed",
  abandoned: "Action dropped",
  upcoming: "",
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
  });

  // Event creation form state
  const [eventForm, setEventForm] = useState<CreateActionEventDto>({
    title: "",
    description: "",
    newStatus: "gathering_commitments",
    date: formatDateForInput(new Date()),
    showInTimeline: true,
    sendNotifsTo: "all",
    deadline: undefined,
  });

  const [useCustomName, setUseCustomName] = useState<boolean>(false);
  const [launchNow, setLaunchNow] = useState<boolean>(true);
  const [deadlineExists, setDeadlineExists] = useState<boolean>(false);
  const [notifData, setNotifData] = useState<PreEventNotifDataDto | null>(null);

  const [creatingEvent, setCreatingEvent] = useState<boolean>(false);
  const [eventCreatedSuccess, setEventCreatedSuccess] =
    useState<boolean>(false);

  const [addEventExpanded, setAddEventExpanded] = useState(true);

  useEffect(() => {
    const loadNotifData = async () => {
      const response = await actionsEventNotifData({
        path: { id: parseInt(actionId || "") },
        query: {
          type: eventForm.newStatus,
          sendNotifsTo: eventForm.sendNotifsTo,
        },
      });
      if (response.data) {
        setNotifData(response.data);
      }
    };
    loadNotifData();
  }, [eventForm.newStatus, eventForm.sendNotifsTo, actionId]);

  console.log(notifData);

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
      });
      setImageFile(null);
      setImagePreview(null);
      setError(null);
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
        });

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

  const handleActionUpdated = useCallback(() => {
    // Stay on current page, action data will refresh
  }, []);

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

  const handleEventInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setEventForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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
          handleActionUpdated();
        }
      }
      setSaving(false);
    } catch (err) {
      setError("Failed to save action");
      setSaving(false);
      console.error(err);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action) return;

    setCreatingEvent(true);

    try {
      const eventData = {
        ...eventForm,
        title: useCustomName
          ? eventForm.title
          : defaultEventNames[eventForm.newStatus as ActionStatus],
        description: useCustomName ? eventForm.description : "",
        date: launchNow
          ? new Date().toISOString()
          : new Date(eventForm.date).toISOString(),
      };

      if (!actionId) return;

      const response = await actionsAddEvent({
        path: { id: parseInt(actionId) },
        body: eventData,
      });

      if (response.data) {
        setAction(response.data);
        handleActionUpdated();

        // Show success feedback
        setEventCreatedSuccess(true);
        setTimeout(() => setEventCreatedSuccess(false), 3000);

        // Reset form
        setEventForm({
          title: "",
          description: "",
          newStatus: "gathering_commitments",
          date: formatDateForInput(new Date()),
          showInTimeline: true,
          sendNotifsTo: "all",
        });
        setUseCustomName(false);
        setLaunchNow(true);
      } else {
        setError("Failed to add event");
      }
    } catch (err) {
      setError("Failed to add event");
      console.error(err);
    } finally {
      setCreatingEvent(false);
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
                />
              </Card>
            )}

            {activeTab === "events" && action && (
              <div className="space-y-4">
                <Card style={CardStyle.White}>
                  <div className="flex flex-row items-center justify-start gap-x-2">
                    <button
                      onClick={() => setAddEventExpanded(!addEventExpanded)}
                      style={{
                        transform: addEventExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      <DropdownIcon size="small" fill="black" />
                    </button>
                    <h2 className="text-lg font-semibold">Add New Event</h2>
                  </div>
                  {addEventExpanded && (
                    <form onSubmit={handleAddEvent} className="space-y-4 mt-4">
                      <div className="mb-4 flex flex-row items-center">
                        <label
                          htmlFor="newStatus"
                          className="block text-black min-w-25"
                        >
                          New Status
                        </label>
                        <select
                          id="newStatus"
                          name="newStatus"
                          value={eventForm.newStatus}
                          onChange={handleEventInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(statusOptions).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div
                        className={`${
                          useCustomName ? "bg-zinc-100" : ""
                        } p-2 -m-1 rounded-md`}
                      >
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id="useCustomName"
                            checked={useCustomName}
                            onChange={(e) => setUseCustomName(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="useCustomName"
                            className="ml-2 block text-black"
                          >
                            Use custom name
                          </label>
                        </div>
                        {!useCustomName && (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <p className="text-sm text-blue-800">
                              <strong>Using default title:</strong>{" "}
                              {defaultEventNames[
                                eventForm.newStatus as ActionStatus
                              ] || "No default name for this status"}
                            </p>
                          </div>
                        )}

                        {useCustomName && (
                          <>
                            <div>
                              <label
                                htmlFor="eventTitle"
                                className="block text-black mb-1"
                              >
                                Event Title *
                              </label>
                              <input
                                type="text"
                                id="eventTitle"
                                name="title"
                                value={eventForm.title}
                                onChange={handleEventInputChange}
                                required={useCustomName}
                                placeholder="e.g., Launch Event, Commitments Reached"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="eventDescription"
                                className="block text-black mb-1"
                              >
                                Description
                              </label>
                              <textarea
                                id="eventDescription"
                                name="description"
                                value={eventForm.description}
                                onChange={handleEventInputChange}
                                rows={2}
                                placeholder="Describe what happened or what this event represents"
                                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div
                        className={`${
                          !launchNow ? "bg-zinc-100" : ""
                        } p-2 -m-1 rounded-md mt-4`}
                      >
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="launchNow"
                            checked={launchNow}
                            onChange={(e) => setLaunchNow(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="launchNow"
                            className="ml-2 block text-black"
                          >
                            Launch now
                          </label>
                        </div>

                        {!launchNow && (
                          <div>
                            <label
                              htmlFor="eventDate"
                              className="block text-black mb-1"
                            >
                              Launch time (
                              {Intl.DateTimeFormat().resolvedOptions().timeZone}
                              ):
                            </label>
                            <input
                              type="datetime-local"
                              id="eventDate"
                              name="date"
                              value={eventForm.date}
                              onChange={handleEventInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      <div
                        className={`${
                          deadlineExists ? "bg-zinc-100" : ""
                        } p-2 -m-1 rounded-md`}
                      >
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="deadlineExists"
                            checked={deadlineExists}
                            onChange={(e) =>
                              setDeadlineExists(e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="deadlineExists"
                            className="ml-2 block text-black"
                          >
                            Has deadline
                          </label>
                        </div>

                        {deadlineExists && (
                          <div>
                            <label
                              htmlFor="deadline"
                              className="block text-black mb-1"
                            >
                              Event Deadline Date & Time * (
                              {Intl.DateTimeFormat().resolvedOptions().timeZone}
                              )
                            </label>
                            <input
                              type="datetime-local"
                              id="deadline"
                              name="deadline"
                              value={eventForm.deadline}
                              onChange={handleEventInputChange}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="sendNotifsTo"
                            className="block text-black mb-1"
                          >
                            Send Notifications To
                          </label>
                          <select
                            id="sendNotifsTo"
                            name="sendNotifsTo"
                            value={eventForm.sendNotifsTo}
                            onChange={handleEventInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">All</option>
                            <option value="none">None</option>
                          </select>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="showInTimeline"
                            name="showInTimeline"
                            checked={eventForm.showInTimeline}
                            onChange={handleEventInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-10"
                          />
                          <label
                            htmlFor="showInTimeline"
                            className="ml-2 block text-black"
                          >
                            Show in public timeline
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={creatingEvent}
                        className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                          creatingEvent
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : eventCreatedSuccess
                            ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                            : "bg-[#333] text-white hover:bg-[#444] focus:ring-blue-500"
                        }`}
                      >
                        {creatingEvent ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Adding Event...
                          </span>
                        ) : eventCreatedSuccess ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Event Added!
                          </span>
                        ) : (
                          "Add Event"
                        )}
                      </button>
                      <div>
                        <p>
                          This will send <b>{notifData?.n_emails}</b> emails and{" "}
                          <b>{notifData?.n_texts}</b> texts
                        </p>
                      </div>
                    </form>
                  )}
                </Card>
                <h2 className="text-lg font-semibold mb-4">All Events</h2>
                <div className="space-y-3">
                  {action.events && action.events.length > 0 ? (
                    action.events
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((event) => (
                        <div
                          key={event.id}
                          className="border border-gray-200 rounded-lg p-3 bg-white"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900 text-sm">
                              {event.title}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                event.newStatus
                              )}`}
                            >
                              {formatStatus(event.newStatus)}
                            </span>
                          </div>

                          {event.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {event.description}
                            </p>
                          )}

                          <div className="text-xs text-gray-500 space-y-1">
                            <div>
                              Date:{" "}
                              {new Date(event.date).toLocaleString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZoneName: "short",
                              })}
                            </div>
                            <div>
                              Notifications: {event.sendNotifsTo} | Timeline:{" "}
                              {event.showInTimeline ? "Visible" : "Hidden"}
                            </div>
                          </div>

                          <div className="pt-2 mt-2 flex flex-row gap-x-2">
                            <Button
                              onClick={() =>
                                window.open(
                                  `/database?table=action_event&id=${event.id}`,
                                  "_blank"
                                )
                              }
                              color={ButtonColor.White}
                              className="!px-3 !text-xs gap-x-1"
                            >
                              <DatabaseIcon />
                              Edit in Database
                            </Button>
                            <Button
                              onClick={() =>
                                window.open(
                                  `/database?table=action_event&id=${event.id}`,
                                  "_blank"
                                )
                              }
                              color={ButtonColor.White}
                              className="!px-3 !text-xs gap-x-1"
                              disabled
                            >
                              See notifications
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No events created yet. Add an event to change the action
                      status.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionDashboard;
