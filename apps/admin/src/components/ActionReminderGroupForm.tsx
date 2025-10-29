import {
  ActionEventDto,
  CreateTodReminderGroupDto,
  GroupDto,
  ReminderCohortType,
  ReminderGroup,
  User,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import React, { useEffect, useMemo, useRef, useState } from "react";
import TextareaWithHighlights from "./TextareaWithHighlights";
import UserSelect, { UserSelectUser } from "./UserSelect";
import { keywords } from "./ActionReminderForm";
import {
  defaultEmailContents,
  defaultEmailSubject,
  defaultTextMessage,
} from "./ActionRemindersTab";

export type ActionReminderGroupFormSubmitPayload = CreateTodReminderGroupDto & {
  memberActionEventId: number;
};

export type ActionReminderGroupFormInitialValues = {
  memberActionEventId: number;
  reminderGroup: ReminderGroup | null;
  users: User[];
};

interface ActionReminderFormProps {
  memberEvents: ActionEventDto[];
  users: UserSelectUser[];
  loadingUsers: boolean;
  userGroups: GroupDto[];
  loadingUserGroups: boolean;
  userGroupsError?: string | null;
  initialValues: ActionReminderGroupFormInitialValues;
  submitting?: boolean;
  submitLabel?: string;
  serverError?: string | null;
  serverSuccess?: string | null;
  disableEventSelection?: boolean;
  onCancel?: () => void;
  onEventChange?: (eventId: number) => void;
  onSubmit: (
    payload: ActionReminderGroupFormSubmitPayload
  ) => Promise<void> | void;
}

const ActionReminderGroupForm: React.FC<ActionReminderFormProps> = ({
  memberEvents,
  users,
  loadingUsers,
  userGroups,
  loadingUserGroups,
  userGroupsError = null,
  initialValues,
  submitting = false,
  submitLabel = "Create Reminders",
  serverError = null,
  serverSuccess = null,
  disableEventSelection = false,
  onCancel,
  onEventChange,
  onSubmit,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    initialValues.memberActionEventId ?? null
  );
  const [sendDay, setSendDay] = useState<string>(
    initialValues.reminderGroup?.sendDayString ??
      new Date().toISOString().split("T")[0]
  );
  const [name, setName] = useState<string>(
    initialValues.reminderGroup?.name ?? ""
  );

  const [emailSubject, setEmailSubject] = useState<string>(
    initialValues.reminderGroup?.emailSubject ?? defaultEmailSubject
  );
  const [emailMessage, setEmailMessage] = useState<string>(
    initialValues.reminderGroup?.emailMessage ?? defaultEmailContents
  );
  const [textMessage, setTextMessage] = useState<string>(
    initialValues.reminderGroup?.textMessage ?? defaultTextMessage
  );
  const [cohortType, setCohortType] = useState<ReminderCohortType>(
    initialValues.reminderGroup?.cohortType ?? "all_uncompleted"
  );
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(
    initialValues.users.map((user) => user.id)
  );
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(
    initialValues.reminderGroup?.userGroup?.id ?? null
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const initialSnapshotRef = useRef<string>("");

  const computedInitialSnapshot = useMemo(() => {
    const userIds = [...initialValues.users.map((user) => user.id)].sort(
      (a, b) => a - b
    );
    return JSON.stringify({
      memberActionEventId: initialValues.memberActionEventId,
      reminder: {
        ...initialValues.reminderGroup,
        userIds: userIds,
        userGroupId: initialValues.reminderGroup?.userGroup?.id ?? null,
      },
      selectedUsers: userIds,
    });
  }, [initialValues]);

  useEffect(() => {
    if (computedInitialSnapshot === initialSnapshotRef.current) {
      return;
    }
    initialSnapshotRef.current = computedInitialSnapshot;

    setSelectedEventId(initialValues.memberActionEventId);
    onEventChange?.(initialValues.memberActionEventId);
    setSendDay(
      initialValues.reminderGroup?.sendDayString ??
        new Date().toISOString().split("T")[0]
    );
    setName(initialValues.reminderGroup?.name ?? "");
    setEmailSubject(
      initialValues.reminderGroup?.emailSubject ?? defaultEmailSubject
    );
    setEmailMessage(
      initialValues.reminderGroup?.emailMessage ?? defaultEmailContents
    );
    setTextMessage(
      initialValues.reminderGroup?.textMessage ?? defaultTextMessage
    );
    setCohortType(initialValues.reminderGroup?.cohortType ?? "all_uncompleted");
    setSelectedUserIds(initialValues.users.map((user) => user.id));
    setSelectedGroupId(initialValues.reminderGroup?.userGroup?.id ?? null);
    setLocalError(null);
  }, [
    computedInitialSnapshot,
    initialValues,
    memberEvents,
    onEventChange,
    disableEventSelection,
  ]);

  const handleEventSelection = (value: string) => {
    const nextId = value ? Number(value) : null;
    if (nextId) {
      setSelectedEventId(nextId);
      onEventChange?.(nextId);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!selectedEventId) {
      setLocalError("Select a member action event first.");
      return;
    }

    if (cohortType === "custom" && selectedUserIds.length === 0) {
      setLocalError("Select at least one user.");
      return;
    }

    if (cohortType === "group" && !selectedGroupId) {
      setLocalError("Select a user group.");
      return;
    }

    const userIds = cohortType === "custom" ? selectedUserIds : undefined;

    await onSubmit({
      name,
      cohortType,
      sendDay,
      emailSubject,
      emailMessage,
      textMessage,
      memberActionEventId: selectedEventId,
      userIds,
      userGroupId:
        cohortType === "group" ? selectedGroupId ?? undefined : undefined,
    });
  };

  const combinedError = localError ?? serverError ?? null;

  const [keywordsHelpExpanded, setKeywordsHelpExpanded] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Member Action Event
        </label>
        <select
          value={selectedEventId ?? ""}
          onChange={(event) => handleEventSelection(event.target.value)}
          disabled={disableEventSelection}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="" disabled>
            Select an event
          </option>
          {memberEvents.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title || `Event #${event.id}`} —{" "}
              {new Date(event.date).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Send date
          </label>
          <input
            type="date"
            value={sendDay}
            onChange={(event) => setSendDay(event.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reminder name
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="admin-only identifier"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Subject
        </label>
        <TextareaWithHighlights
          keywords={keywords}
          value={emailSubject}
          onChange={setEmailSubject}
          rows={1}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Message
        </label>
        <TextareaWithHighlights
          keywords={keywords}
          value={emailMessage}
          onChange={setEmailMessage}
          rows={5}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Message
        </label>
        <TextareaWithHighlights
          keywords={keywords}
          value={textMessage}
          onChange={setTextMessage}
          rows={2}
        />
      </div>

      <div
        className={`p-2 border border-gray-200 rounded-md bg-zinc-100 ${
          !keywordsHelpExpanded ? "hover:border-gray-300" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => setKeywordsHelpExpanded(!keywordsHelpExpanded)}
          className="text-sm w-full text-left"
        >
          Keyword replacement syntax{keywordsHelpExpanded ? " " : "..."}
        </button>
        {keywordsHelpExpanded && (
          <div className="mt-2 text-sm">
            <table id="keywordstable" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Example Value</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{"#{fullname}"}</td>
                  <td>John Fitzgerald Doe</td>
                  <td>Member&apos;s full name</td>
                </tr>
                <tr>
                  <td>{"#{firstname}"}</td>
                  <td>John</td>
                  <td>Member&apos;s first name</td>
                </tr>
                <tr>
                  <td>{"#{lastname}"}</td>
                  <td>Doe</td>
                  <td>Member&apos;s last name</td>
                </tr>
                <tr>
                  <td>{"#{action}"}</td>
                  <td>Sign a petition to use less cups</td>
                  <td>The name of the action</td>
                </tr>
                <tr>
                  <td>{"#{days}"}</td>
                  <td>2 days</td>
                  <td>
                    The number of days until the action is due, with
                    &apos;days&apos; attached
                  </td>
                </tr>
                <tr>
                  <td>{"#{link}"}</td>
                  <td>https://www.worldalliance.org/actions/123?cid=123</td>
                  <td>The link to the action, with tracking CID included</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recipients
        </label>
        <select
          value={cohortType}
          onChange={(event) =>
            setCohortType(event.target.value as ReminderCohortType)
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="all_uncompleted">All uncompleted</option>
          <option value="group">User group</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {cohortType === "group" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User group
          </label>
          <select
            value={selectedGroupId ?? ""}
            onChange={(event) =>
              setSelectedGroupId(
                event.target.value ? Number(event.target.value) : null
              )
            }
            disabled={loadingUserGroups}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="" disabled>
              {loadingUserGroups ? "Loading groups…" : "Select a group"}
            </option>
            {userGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          {!loadingUserGroups && userGroupsError && (
            <p className="mt-2 text-xs text-red-600">{userGroupsError}</p>
          )}
          {!loadingUserGroups &&
            !userGroupsError &&
            userGroups.length === 0 && (
              <p className="mt-2 text-xs text-gray-500">
                No groups available. Create a group before scheduling.
              </p>
            )}
        </div>
      )}

      {cohortType === "custom" && (
        <UserSelect
          users={users}
          selectedUserIds={selectedUserIds}
          onChange={setSelectedUserIds}
          loading={loadingUsers}
        />
      )}

      {combinedError && (
        <p className="text-red-600 text-sm" role="alert">
          {combinedError}
        </p>
      )}
      {serverSuccess && (
        <p className="text-green-600 text-sm">{serverSuccess}</p>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            color={ButtonColor.Light}
            className="px-4 py-2"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitting || loadingUsers}
          color={ButtonColor.Black}
          className="px-4 py-2"
        >
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ActionReminderGroupForm;
