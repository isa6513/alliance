import {
  ActionSuiteDto,
  GroupDto,
  NotificationPlan,
  ReminderGroup,
  actionsCreateReminderGroup,
  actionsDeleteReminderGroup,
  actionsPlansForGroup,
  actionsReminderGroupsForEvent,
  actionsSentNotifsForGroup,
  actionsUpdateReminderGroup,
  userGetGroups,
  userList,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  format,
  formatDistanceStrict,
  isValid,
  parseISO,
  subSeconds,
} from "date-fns";
import ActionReminderGroupForm, {
  ActionReminderGroupFormSubmitPayload,
} from "./ActionReminderGroupForm";
import { UserSelectUser } from "./UserSelect";
import {
  defaultAnnouncementEmailContents,
  defaultAnnouncementEmailSubject,
  defaultAnnouncementTextMessage,
  defaultEmailContents,
  defaultEmailSubject,
  defaultMissedDeadlineEmailContents,
  defaultMissedDeadlineEmailSubject,
  defaultMissedDeadlineTextMessage,
  defaultTextMessage,
  hoursEmailContents,
  hoursEmailSubject,
  hoursTextMessage,
} from "./defaultReminderContents";
import { ActionEventNotifDto } from "@alliance/shared/client";
import ActionReminderCard from "./ActionReminderCard";
import { useToast } from "@alliance/shared/ui/ToastProvider";

interface ActionRemindersTabProps {
  suite: ActionSuiteDto;
  highlightedReminder?: number;
}

const DISPLAY_DATETIME_FORMAT = "PP p";

const ActionRemindersTab: React.FC<ActionRemindersTabProps> = ({
  suite,
  highlightedReminder,
}) => {
  const action = suite.actions[0];
  const memberEvents = useMemo(
    () =>
      (action.events || []).filter(
        (event) => event.newStatus === "member_action"
      ),
    [action.events]
  );
  const sortedActionEvents = useMemo(() => {
    return (action.events || [])
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [action.events]);
  const nextEventById = useMemo(() => {
    const map = new Map<number, (typeof sortedActionEvents)[number]>();
    sortedActionEvents.forEach((event, index) => {
      const next = sortedActionEvents[index + 1];
      if (next) {
        map.set(event.id, next);
      }
    });
    return map;
  }, [sortedActionEvents]);

  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    memberEvents.length > 0 ? memberEvents[0].id : null //TODO: collate or move between events
  );
  const [users, setUsers] = useState<UserSelectUser[]>([]);
  const [userGroups, setUserGroups] = useState<GroupDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [loadingUserGroups, setLoadingUserGroups] = useState<boolean>(false);
  const [userGroupsError, setUserGroupsError] = useState<string | null>(null);

  const [createGroupExpanded, setCreateGroupExpanded] =
    useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [reminderGroups, setReminderGroups] = useState<ReminderGroup[]>([]);

  useEffect(() => {
    if (memberEvents.length && selectedEventId == null) {
      setSelectedEventId(memberEvents[0].id);
    }
  }, [memberEvents, selectedEventId]);

  useEffect(() => {
    setLoadingUsers(true);
    userList()
      .then((response) => {
        const mappedUsers = (response.data ?? []).map<UserSelectUser>(
          (user) => ({
            id: user.id,
            name: user.name ?? undefined,
            displayName: user.name ?? undefined,
          })
        );
        setUsers(mappedUsers);
      })
      .catch((err) => {
        console.error(err);
        setCreateError("Failed to load users.");
      })
      .finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    setLoadingUserGroups(true);
    setUserGroupsError(null);
    userGetGroups()
      .then((response) => {
        if (response.error) {
          throw new Error(
            typeof response.error === "string"
              ? response.error
              : "Failed to load user groups."
          );
        }
        setUserGroups(response.data ?? []);
      })
      .catch((err) => {
        console.error(err);
        setUserGroupsError(
          err instanceof Error ? err.message : "Failed to load user groups."
        );
      })
      .finally(() => setLoadingUserGroups(false));
  }, []);

  const refreshReminderGroups = useCallback(async (eventId: number) => {
    const response = await actionsReminderGroupsForEvent({
      path: { id: eventId },
    });

    if (response.error) {
      throw new Error(
        typeof response.error === "string"
          ? response.error
          : "Failed to load reminders."
      );
    }

    if (!response.data) {
      setLoadError("Failed to load reminders");
      throw new Error("Failed to load reminders.");
    }

    console.log("fetched reminders", response.data);

    setReminderGroups(response.data);
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      refreshReminderGroups(selectedEventId);
    }
  }, [selectedEventId, refreshReminderGroups]);

  const handleDeleteGroup = async (groupId: number) => {
    const ok = await confirm({
      message:
        "Delete reminder group? All planned reminders will no longer be sent.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) {
      return;
    }
    const resp = await actionsDeleteReminderGroup({
      path: { groupId },
    });
    if (resp.response.ok) {
      if (selectedEventId) {
        refreshReminderGroups(selectedEventId);
      }
    }
  };

  const parseDate = (value?: string | Date | null) => {
    if (!value) {
      return null;
    }
    const date = typeof value === "string" ? parseISO(value) : value;
    return isValid(date) ? date : null;
  };

  const formatDisplayDate = (value?: string | Date | null) => {
    const date = parseDate(value);
    return date ? format(date, DISPLAY_DATETIME_FORMAT) : null;
  };

  const getGroupMemberEventId = (group: ReminderGroup) =>
    group.memberActionEvent?.id ?? null;

  const findGroupDeadlineEvent = (group: ReminderGroup) => {
    const memberEventId = getGroupMemberEventId(group);

    if (!memberEventId) {
      return undefined;
    }
    return nextEventById.get(memberEventId);
  };

  const [showReminderPlans, setShowReminderPlans] = useState<number | null>(
    null
  );
  const [showSentReminders, setShowSentReminders] = useState<number | null>(
    null
  );
  const [reminderPlans, setReminderPlans] = useState<NotificationPlan[]>([]);
  const [sentReminders, setSentReminders] = useState<ActionEventNotifDto[]>([]);

  useEffect(() => {
    setReminderPlans([]);
    if (showReminderPlans) {
      actionsPlansForGroup({
        path: { groupId: showReminderPlans },
      }).then((response) => {
        setReminderPlans(response.data ?? []);
      });
    }
  }, [showReminderPlans]);

  useEffect(() => {
    if (showSentReminders) {
      actionsSentNotifsForGroup({
        path: { groupId: showSentReminders },
      }).then((response) => {
        setSentReminders(response.data ?? []);
      });
    }
  }, [showSentReminders]);

  const getGroupRange = (group: ReminderGroup) => {
    const start = group.send_range_start ?? null;
    const end = group.send_range_end ?? null;
    return { start: parseDate(start), end: parseDate(end) };
  };

  const describeGroupSchedule = (
    group: ReminderGroup
  ): { primary: string; secondary?: string | null } => {
    if (group.timingMode === "absolute") {
      const sendAtLabel = formatDisplayDate(group.sendAtAbsolute);
      return {
        primary: sendAtLabel
          ? `Sends ${sendAtLabel}`
          : "Absolute schedule configured",
        secondary: sendAtLabel ? "Absolute schedule" : null,
      };
    }

    if (group.timingMode === "from_deadline") {
      const deadlineEvent =
        group.deadlineEvent ?? findGroupDeadlineEvent(group);
      const deadlineDate = parseDate(deadlineEvent?.date);
      const seconds = group.sendAtSecondsFromDeadline ?? 0;
      if (deadlineDate) {
        const sendDate = subSeconds(deadlineDate, seconds);
        const referenceTitle =
          deadlineEvent?.title?.trim() ||
          `deadline on ${format(deadlineDate, DISPLAY_DATETIME_FORMAT)}`;
        if (seconds === 0) {
          return {
            primary: `Sends when ${referenceTitle} begins`,
            secondary: `${format(
              sendDate,
              DISPLAY_DATETIME_FORMAT
            )} • Deadline ${format(deadlineDate, DISPLAY_DATETIME_FORMAT)}`,
          };
        }
        const distance = formatDistanceStrict(deadlineDate, sendDate, {
          roundingMethod: "floor",
        });
        return {
          primary: `Sends ${distance} ${
            seconds >= 0 ? "before" : "after"
          } ${referenceTitle}`,
          secondary: `${format(
            sendDate,
            DISPLAY_DATETIME_FORMAT
          )} • Deadline ${format(deadlineDate, DISPLAY_DATETIME_FORMAT)}`,
        };
      }
      return {
        primary: "Relative schedule",
        secondary: "Waiting for deadline details",
      };
    }

    if (group.timingMode === "within_range") {
      const { start, end } = getGroupRange(group);
      if (start && end) {
        return {
          primary: `Sends between ${format(
            start,
            DISPLAY_DATETIME_FORMAT
          )} and ${format(end, DISPLAY_DATETIME_FORMAT)}`,
          secondary: "Personalized window",
        };
      }
      return {
        primary: "Personalized window",
        secondary: "Range not fully configured",
      };
    }
    if (group.timingMode === "event_launch") {
      const launchDate = parseDate(group.memberActionEvent?.date);
      return {
        primary: launchDate
          ? `Sends when launch event begins (${format(
              launchDate,
              DISPLAY_DATETIME_FORMAT
            )})`
          : "Sends when launch event begins",
        secondary: null,
      };
    }

    return {
      primary: "Scheduled group reminder",
      secondary: null,
    };
  };

  const { confirm } = useToast();

  const populateDefaultReminders = async () => {
    if (!selectedEventId) {
      setCreateError("add a member action event to the suite first.");
      return;
    }

    const ok = await confirm({
      title: "Populate default reminders?",
      message:
        "This will create reminders that will be sent to all members of this action and may be sent immediately if member action is ongoing.",
      confirmLabel: "Populate Reminders",
      cancelLabel: "Cancel",
    });
    if (!ok) {
      return;
    }

    const reminders: Awaited<ReturnType<typeof actionsCreateReminderGroup>>[] =
      [];

    const announcement = await actionsCreateReminderGroup({
      path: { eventId: selectedEventId },
      body: {
        suiteId: suite.id,
        timingMode: "event_launch",
        cohortType: "all_uncompleted",
        textMessage: defaultAnnouncementTextMessage,
        name: "Member Action announcement",
        emailMessage: defaultAnnouncementEmailContents,
        emailSubject: defaultAnnouncementEmailSubject,
      },
    });
    reminders.push(announcement);

    const deadlineEvent = nextEventById.get(selectedEventId);
    if (deadlineEvent) {
      const twoDay = await actionsCreateReminderGroup({
        path: { eventId: selectedEventId },
        body: {
          suiteId: suite.id,
          timingMode: "within_range",
          send_range_start: new Date(
            new Date(deadlineEvent.date).getTime() - 48 * 60 * 60 * 1000
          ).toISOString(),
          send_range_end: new Date(
            new Date(deadlineEvent.date).getTime() - 24 * 60 * 60 * 1000
          ).toISOString(),
          cohortType: "all_uncompleted",
          textMessage: defaultTextMessage,
          emailSubject: defaultEmailSubject,
          emailMessage: defaultEmailContents,
          name: "24-48h reminder",
        },
      });
      reminders.push(twoDay);

      const oneDay = await actionsCreateReminderGroup({
        path: { eventId: selectedEventId },
        body: {
          suiteId: suite.id,
          timingMode: "within_range",
          send_range_start: new Date(
            new Date(deadlineEvent.date).getTime() - 24 * 60 * 60 * 1000
          ).toISOString(),
          send_range_end: new Date(
            new Date(deadlineEvent.date).getTime() - 6 * 60 * 60 * 1000
          ).toISOString(),
          cohortType: "all_uncompleted",
          textMessage: hoursTextMessage,
          emailSubject: hoursEmailSubject,
          emailMessage: hoursEmailContents,
          name: "6-24h reminder",
        },
      });
      reminders.push(oneDay);

      const threeHour = await actionsCreateReminderGroup({
        path: { eventId: selectedEventId },
        body: {
          suiteId: suite.id,
          timingMode: "from_deadline",
          sendAtSecondsFromDeadline: 3 * 60 * 60,
          cohortType: "all_uncompleted",
          textMessage: hoursTextMessage,
          emailMessage: hoursEmailContents,
          emailSubject: hoursEmailSubject,
          name: "3 hour reminder",
        },
      });
      reminders.push(threeHour);

      const missedDeadline = await actionsCreateReminderGroup({
        path: { eventId: selectedEventId },
        body: {
          suiteId: suite.id,
          timingMode: "from_deadline",
          sendAtSecondsFromDeadline: 0,
          cohortType: "all_uncompleted",
          textMessage: defaultMissedDeadlineTextMessage,
          emailMessage: defaultMissedDeadlineEmailContents,
          emailSubject: defaultMissedDeadlineEmailSubject,
          name: "Missed deadline message",
        },
      });
      reminders.push(missedDeadline);
    }
    const error = reminders.some(
      (reminder) => (reminder as unknown as { error: string | undefined }).error
    );
    if (error) {
      setCreateError("Failed to create reminders.");
    }
    if (reminders.every((reminder) => reminder.data)) {
      setCreateSuccess("Reminders created successfully.");
    }
    setReminderGroups((prev) => [
      ...prev,
      ...reminders
        .filter((reminder) => reminder.data !== undefined)
        .map((reminder) => reminder.data),
    ]);
  };

  const handleCreateGroupSubmit = async (
    payload: ActionReminderGroupFormSubmitPayload
  ) => {
    setCreateError(null);
    setCreateSuccess(null);
    setCreateSubmitting(true);

    try {
      const { memberActionEventId: eventId, ...body } = payload;
      const updatedBody = {
        ...body,
        suiteId: suite.id,
      };
      if (!eventId) {
        throw new Error("Select a member action event first.");
      }

      setSelectedEventId(eventId);
      const response = await actionsCreateReminderGroup({
        path: { eventId },
        body: updatedBody,
      });

      if (response.error || !response.data) {
        throw new Error(
          (response.error as string) ?? "Failed to create reminder."
        );
      }

      await refreshReminderGroups(eventId);
      setCreateSuccess("Personal reminders group scheduled successfully.");
      setCreateGroupExpanded(false);
    } catch (err) {
      console.error(err);
      setCreateError(
        err instanceof Error ? err.message : "Failed to create reminder."
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleEditGroupSubmit =
    (groupId: number) =>
    async (payload: ActionReminderGroupFormSubmitPayload) => {
      setEditError(null);
      setEditSuccess(null);
      setEditSubmitting(true);
      try {
        const { memberActionEventId: eventId, ...body } = payload;
        const updatedBody = {
          ...body,
          suiteId: suite.id,
        };
        if (!eventId) {
          throw new Error("Select a member action event first.");
        }

        const response = await actionsUpdateReminderGroup({
          path: { groupId },
          body: updatedBody,
        });

        if (!response.data) {
          throw new Error(
            (response.error as string) ?? "Failed to update reminder."
          );
        }

        await refreshReminderGroups(eventId);
        setEditSuccess("Reminder group updated successfully.");
        setEditingGroupId(null);
      } catch (err) {
        console.error(err);
        setEditError(
          err instanceof Error ? err.message : "Failed to update reminder."
        );
      } finally {
        setEditSubmitting(false);
      }
    };

  const handleEditGroupStart = (groupId: number) => {
    setEditingGroupId(groupId);
    setEditError(null);
    setEditSuccess(null);
  };

  const handleEditCancel = () => {
    setEditingGroupId(null);
    setEditError(null);
    setEditSuccess(null);
  };

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (highlightedReminder) {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [highlightedReminder]);

  if (!memberEvents.length) {
    return (
      <Card style={CardStyle.White}>
        <p className="text-sm text-gray-600">
          No member action events yet. Add a member action event to schedule
          reminders.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mb-5">
      {loadError && <p className="text-sm text-red-600 mb-2">{loadError}</p>}
      <Card style={CardStyle.White}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold">Schedule a notification</h3>
            <div className="flex flex-row gap-2">
              <Button
                type="button"
                color={ButtonColor.Black}
                className="px-3 py-1 text-sm"
                onClick={() => setCreateGroupExpanded((prev) => !prev)}
              >
                {createGroupExpanded ? "Hide form" : "New reminder"}
              </Button>
              {!createGroupExpanded && reminderGroups.length === 0 && (
                <Button
                  type="button"
                  color={ButtonColor.Green}
                  className="px-3 py-1 text-sm"
                  onClick={populateDefaultReminders}
                >
                  Populate default reminders
                </Button>
              )}
            </div>
          </div>
          {!createGroupExpanded && createSuccess && (
            <p className="text-sm text-green">{createSuccess}</p>
          )}
          {createGroupExpanded && selectedEventId !== null && (
            <>
              <p className="text-sm text-gray-600">
                Creates a personal reminder for each user based on their time
                zone and reminder time preference.
              </p>
              <ActionReminderGroupForm
                memberEvents={memberEvents}
                users={users}
                loadingUsers={loadingUsers}
                userGroups={userGroups}
                loadingUserGroups={loadingUserGroups}
                userGroupsError={userGroupsError}
                initialValues={{
                  memberActionEventId: selectedEventId,
                  reminderGroup: null,
                  users: [],
                }}
                submitting={createSubmitting}
                serverError={createError}
                serverSuccess={createSuccess}
                onCancel={() => setCreateGroupExpanded(false)}
                onEventChange={setSelectedEventId}
                onSubmit={handleCreateGroupSubmit}
              />
            </>
          )}
        </div>
      </Card>
      {reminderGroups.map((group) => {
        const groupSchedule = describeGroupSchedule(group);
        return (
          <ActionReminderCard
            key={group.id}
            group={group}
            highlightedReminder={highlightedReminder}
            ref={ref}
            groupSchedule={groupSchedule}
            editing={editingGroupId === group.id}
            handleEditCancel={handleEditCancel}
            handleEditGroupStart={handleEditGroupStart}
            handleDeleteGroup={handleDeleteGroup}
            selectedEventId={selectedEventId}
            memberEvents={memberEvents}
            users={users}
            loadingUsers={loadingUsers}
            userGroups={userGroups}
            loadingUserGroups={loadingUserGroups}
            userGroupsError={userGroupsError}
            editSubmitting={editSubmitting}
            editError={editError}
            editSuccess={editSuccess}
            handleEditGroupSubmit={handleEditGroupSubmit}
            setShowReminderPlans={setShowReminderPlans}
            showReminderPlans={showReminderPlans}
            setShowSentReminders={setShowSentReminders}
            showSentReminders={showSentReminders}
            reminderPlans={reminderPlans}
            sentReminders={sentReminders}
          />
        );
      })}
    </div>
  );
};

export default ActionRemindersTab;
