import {
  ActionSuiteDto,
  TagDto,
  PreviewNotificationPlan,
  ReminderGroup,
  actionsCreateReminderGroup,
  actionsDeleteReminderGroup,
  actionsPlansForGroup,
  actionsReminderGroupsForEvent,
  actionsSentNotifsForGroup,
  actionsUpdateReminderGroup,
  userGetTags,
  userList,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import Card, { CardStyle } from "@alliance/sharedweb/ui/Card";
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
import { UserSelectUser } from "@alliance/sharedweb/ui/UserSelect";
import { ActionEventNotifDto } from "@alliance/shared/client";
import ActionReminderCard from "./ActionReminderCard";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";
import { presetNames, ReminderPresetName, reminderPresets } from "./presets";

interface ActionRemindersTabProps {
  suite: ActionSuiteDto;
  highlightedReminder?: number;
}

export type GroupScheduleLabels = {
  primary: string;
  secondary?: string | null;
  pastTense: string;
};

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
  const [userTags, setUserTags] = useState<TagDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [loadingUserTags, setLoadingUserTags] = useState<boolean>(false);
  const [userTagsError, setUserTagsError] = useState<string | null>(null);

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

  const [reminderPlansByGroup, setReminderPlansByGroup] = useState<
    Partial<Record<number, PreviewNotificationPlan[]>>
  >({});
  const [sentRemindersByGroup, setSentRemindersByGroup] = useState<
    Partial<Record<number, ActionEventNotifDto[]>>
  >({});
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
            profilePicture: user.profilePicture ?? null,
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
    setLoadingUserTags(true);
    setUserTagsError(null);
    userGetTags()
      .then((response) => {
        if (response.error) {
          throw new Error(
            typeof response.error === "string"
              ? response.error
              : "Failed to load user groups."
          );
        }
        setUserTags(response.data ?? []);
      })
      .catch((err) => {
        console.error(err);
        setUserTagsError(
          err instanceof Error ? err.message : "Failed to load user tags."
        );
      })
      .finally(() => setLoadingUserTags(false));
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
    setReminderPlansByGroup({});
    setSentRemindersByGroup({});
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      refreshReminderGroups(selectedEventId);
    }
  }, [selectedEventId, refreshReminderGroups]);

  const handleDeleteGroup = async (
    groupId: number,
    anchor?: HTMLElement | null
  ) => {
    const ok = await confirm({
      message:
        "Delete reminder group? All planned reminders will no longer be sent.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      anchorEl: anchor,
      placement: "topleft",
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

  const parseDate = useCallback((value?: string | Date | null) => {
    if (!value) {
      return null;
    }
    const date = typeof value === "string" ? parseISO(value) : value;
    return isValid(date) ? date : null;
  }, []);

  const formatDisplayDate = (value?: string | Date | null) => {
    const date = parseDate(value);
    return date ? format(date, DISPLAY_DATETIME_FORMAT) : null;
  };

  const getGroupMemberEventId = (group: ReminderGroup) =>
    group.memberActionEvent?.id ?? null;

  const findGroupDeadlineEvent = useCallback(
    (group: ReminderGroup) => {
      const memberEventId = getGroupMemberEventId(group);

      if (!memberEventId) {
        return undefined;
      }
      return nextEventById.get(memberEventId);
    },
    [nextEventById]
  );

  useEffect(() => {
    if (reminderGroups.length === 0) {
      setReminderPlansByGroup({});
      setSentRemindersByGroup({});
      return;
    }

    const groupIds = new Set(reminderGroups.map((group) => group.id));

    setReminderPlansByGroup((prev) => {
      const next: Partial<Record<number, PreviewNotificationPlan[]>> = {};
      groupIds.forEach((id) => {
        if (prev[id] !== undefined) {
          next[id] = prev[id];
        }
      });
      if (
        Object.keys(next).length === Object.keys(prev).length &&
        reminderGroups.every((group) => prev[group.id] !== undefined)
      ) {
        return prev;
      }
      return next;
    });

    setSentRemindersByGroup((prev) => {
      const next: Partial<Record<number, ActionEventNotifDto[]>> = {};
      groupIds.forEach((id) => {
        if (prev[id] !== undefined) {
          next[id] = prev[id];
        }
      });
      if (
        Object.keys(next).length === Object.keys(prev).length &&
        reminderGroups.every((group) => prev[group.id] !== undefined)
      ) {
        return prev;
      }
      return next;
    });
  }, [reminderGroups]);

  useEffect(() => {
    if (!reminderGroups.length) {
      return;
    }

    let cancelled = false;

    const loadGroupDetails = async (groupId: number) => {
      try {
        const [plansResponse, sentResponse] = await Promise.all([
          actionsPlansForGroup({
            path: { groupId },
          }),
          actionsSentNotifsForGroup({
            path: { groupId },
          }),
        ]);

        if (cancelled) {
          return;
        }
        setReminderPlansByGroup((prev) => ({
          ...prev,
          [groupId]: plansResponse.data ?? [],
        }));

        setSentRemindersByGroup((prev) => ({
          ...prev,
          [groupId]: sentResponse.data ?? [],
        }));
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Failed to load reminder details."
          );
        }
      }
    };

    const pendingGroups = reminderGroups.filter(
      (group) =>
        reminderPlansByGroup[group.id] === undefined ||
        sentRemindersByGroup[group.id] === undefined
    );

    if (!pendingGroups.length) {
      return;
    }

    setLoadError(null);

    pendingGroups.forEach((group) => {
      void loadGroupDetails(group.id);
    });

    return () => {
      cancelled = true;
    };
  }, [reminderGroups, reminderPlansByGroup, sentRemindersByGroup]);

  const getGroupRange = (group: ReminderGroup) => {
    const start = group.send_range_start ?? null;
    const end = group.send_range_end ?? null;
    return { start: parseDate(start), end: parseDate(end) };
  };
  const describeGroupSchedule = (group: ReminderGroup): GroupScheduleLabels => {
    if (group.timingMode === "absolute") {
      const sendAtLabel = formatDisplayDate(group.sendAtAbsolute);
      return {
        primary: sendAtLabel
          ? `Sends ${sendAtLabel}`
          : "Absolute schedule configured",
        secondary: sendAtLabel ? "Absolute schedule" : null,
        pastTense: `at ${sendAtLabel}`,
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
            pastTense: `at ${format(sendDate, DISPLAY_DATETIME_FORMAT)}`,
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
          pastTense: `${distance} ${
            seconds >= 0 ? "before" : "after"
          } ${referenceTitle}`,
        };
      }
      return {
        primary: "Relative schedule",
        secondary: "Error: no deadline event found to schedule from",
        pastTense: "Relative schedule",
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
          pastTense: `between ${format(
            start,
            DISPLAY_DATETIME_FORMAT
          )} and ${format(end, DISPLAY_DATETIME_FORMAT)}`,
        };
      }
      return {
        primary: "Personalized window",
        secondary: "Range not fully configured",
        pastTense: "Relative schedule",
      };
    }
    if (group.timingMode === "within_relative_range") {
      const startSeconds =
        group.relative_range_start_seconds_from_deadline ?? null;
      const endSeconds = group.relative_range_end_seconds_from_deadline ?? null;
      const deadlineEvent =
        group.deadlineEvent ?? findGroupDeadlineEvent(group);
      const deadlineDate = parseDate(deadlineEvent?.date);
      if (startSeconds === null || endSeconds === null || !deadlineDate) {
        return {
          primary: "Relative personalized window",
          secondary: "Error: no deadline event found to schedule from",
          pastTense: "Relative personalized window",
        };
      }

      const describeOffset = (seconds: number) => {
        if (seconds === 0) {
          return "at the deadline";
        }
        const distance = formatDistanceStrict(
          new Date(0),
          new Date(Math.abs(seconds) * 1000),
          { roundingMethod: "floor" }
        );
        return `${distance} ${seconds >= 0 ? "before" : "after"}`;
      };

      const startLabel = describeOffset(startSeconds);
      const endLabel = describeOffset(endSeconds);
      const referenceTitle =
        deadlineEvent?.title?.trim() ||
        `deadline on ${format(deadlineDate, DISPLAY_DATETIME_FORMAT)}`;
      const startDate = subSeconds(deadlineDate, startSeconds);
      const endDate = subSeconds(deadlineDate, endSeconds);
      const deadlineLabel = format(deadlineDate, DISPLAY_DATETIME_FORMAT);

      return {
        primary:
          startSeconds === endSeconds
            ? `Sends ${startLabel} ${referenceTitle}`
            : `Sends between ${startLabel} and ${endLabel} ${referenceTitle}`,
        secondary: `${format(startDate, DISPLAY_DATETIME_FORMAT)} – ${format(
          endDate,
          DISPLAY_DATETIME_FORMAT
        )} • Deadline ${deadlineLabel}`,
        pastTense:
          startSeconds === endSeconds
            ? `${startLabel} ${referenceTitle}`
            : `between ${startLabel} and ${endLabel} ${referenceTitle}`,
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
        pastTense: launchDate
          ? `when launch event began (${format(
              launchDate,
              DISPLAY_DATETIME_FORMAT
            )})`
          : "when launch event began",
      };
    }

    return {
      primary: "Scheduled group reminder",
      secondary: null,
      pastTense: "Scheduled group reminder",
    };
  };

  const { confirm } = useToast();

  const populateDefaultReminders = async () => {
    if (!selectedEventId) {
      setCreateError("add a member action event to the suite first.");
      return;
    }

    const mode = import.meta.env.MODE;

    if (mode !== "development") {
      const ok = await confirm({
        title: "Populate default reminders?",
        message: `This will send reminders to all members participating in this action`,
        confirmLabel: "Create",
        cancelLabel: "Cancel",
        mode: "fullscreen",
        requiredText: `I am going to notify many real members`,
      });
      if (!ok) {
        return;
      }
    }

    const reminders: Awaited<ReturnType<typeof actionsCreateReminderGroup>>[] =
      [];

    const deadlineEvent = nextEventById.get(selectedEventId);
    if (deadlineEvent) {
      const twoDay = await actionsCreateReminderGroup({
        path: { eventId: selectedEventId },
        body: {
          suiteId: suite.id,
          ...reminderPresets["Two Day Range"],
        },
      });
      reminders.push(twoDay);

      const oneDay = await actionsCreateReminderGroup({
        path: { eventId: selectedEventId },
        body: {
          suiteId: suite.id,
          ...reminderPresets["One Day Range"],
        },
      });
      reminders.push(oneDay);

      const threeHour = await actionsCreateReminderGroup({
        path: { eventId: selectedEventId },
        body: {
          suiteId: suite.id,
          ...reminderPresets["Three Hour"],
        },
      });
      reminders.push(threeHour);

      const missedDeadline = await actionsCreateReminderGroup({
        path: { eventId: selectedEventId },
        body: {
          suiteId: suite.id,
          ...reminderPresets["Missed Deadline"],
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
    payload: ActionReminderGroupFormSubmitPayload,
    recipientCount: number
  ) => {
    const mode = import.meta.env.MODE;

    if (mode !== "development") {
      const ok = await confirm({
        title: "Create reminder group?",
        message: `This will send emails or texts to ${recipientCount} members.`,
        confirmLabel: "Create",
        cancelLabel: "Cancel",
        mode: "fullscreen",
        requiredText: `I am going to notify ${recipientCount} real members`,
      });
      if (!ok) {
        return;
      }
    }

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

  const [selectingPreset, setSelectingPreset] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] =
    useState<ReminderPresetName | null>(null);

  const sortedReminderGroups = useMemo(() => {
    return reminderGroups
      .map((group) => {
        let sendStartDate: Date | null = null;
        if (group.timingMode === "absolute") {
          sendStartDate = parseDate(group.sendAtAbsolute);
        } else if (group.timingMode === "from_deadline") {
          const deadlineEvent =
            group.deadlineEvent ?? findGroupDeadlineEvent(group);
          const deadlineDate = parseDate(deadlineEvent?.date);
          if (deadlineDate) {
            const seconds = group.sendAtSecondsFromDeadline ?? 0;
            sendStartDate = subSeconds(deadlineDate, seconds);
          }
        } else if (group.timingMode === "within_range") {
          const start = parseDate(group.send_range_start);
          const end = parseDate(group.send_range_end);
          sendStartDate = start ?? end ?? null;
        } else if (group.timingMode === "within_relative_range") {
          const deadlineEvent =
            group.deadlineEvent ?? findGroupDeadlineEvent(group);
          const deadlineDate = parseDate(deadlineEvent?.date);
          const startSeconds =
            group.relative_range_start_seconds_from_deadline ?? null;
          if (deadlineDate && startSeconds !== null) {
            sendStartDate = subSeconds(deadlineDate, startSeconds);
          }
        } else if (group.timingMode === "event_launch") {
          sendStartDate = parseDate(group.memberActionEvent?.date);
        } else {
          sendStartDate =
            parseDate(group.sendAtAbsolute) ??
            parseDate(group.send_range_start) ??
            parseDate(group.send_range_end) ??
            null;
        }

        return {
          group,
          sendStartDate,
        };
      })
      .sort((a, b) => {
        const timeA = a.sendStartDate
          ? a.sendStartDate.getTime()
          : Number.POSITIVE_INFINITY;
        const timeB = b.sendStartDate
          ? b.sendStartDate.getTime()
          : Number.POSITIVE_INFINITY;
        if (timeA === timeB) {
          return a.group.id - b.group.id;
        }
        return timeA - timeB;
      });
  }, [findGroupDeadlineEvent, parseDate, reminderGroups]);

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
              {createGroupExpanded && (
                <div className="relative">
                  <Button
                    type="button"
                    color={ButtonColor.Light}
                    className="px-3 py-1 text-sm"
                    onClick={() => setSelectingPreset((prev) => !prev)}
                  >
                    {createGroupExpanded ? "Load preset..." : ""}
                  </Button>
                  {selectingPreset && (
                    <div className="absolute top-full right-0 p-2 bg-white shadow-md rounded-md">
                      {presetNames.map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          color={ButtonColor.Light}
                          onClick={() => {
                            setSelectedPreset(preset);
                            setSelectingPreset(false);
                          }}
                          className="w-full rounded-none !bg-transparent hover:!bg-zinc-200/60 text-nowrap justify-start"
                        >
                          {preset}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
              <ActionReminderGroupForm
                memberEvents={memberEvents}
                users={users}
                loadingUsers={loadingUsers}
                userTags={userTags}
                loadingUserTags={loadingUserTags}
                userTagsError={userTagsError}
                initialValues={{
                  memberActionEventId: selectedEventId,
                  reminderGroup: selectedPreset
                    ? reminderPresets[selectedPreset]
                    : null,
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
      {sortedReminderGroups.map(({ group, sendStartDate }) => {
        const groupSchedule = describeGroupSchedule(group);
        return (
          <ActionReminderCard
            key={group.id}
            group={group}
            sendStartDate={sendStartDate}
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
            userTags={userTags}
            loadingUserTags={loadingUserTags}
            userTagsError={userTagsError}
            editSubmitting={editSubmitting}
            editError={editError}
            editSuccess={editSuccess}
            handleEditGroupSubmit={handleEditGroupSubmit}
            reminderPlans={reminderPlansByGroup[group.id]}
            sentReminders={sentRemindersByGroup[group.id]}
          />
        );
      })}
    </div>
  );
};

export default ActionRemindersTab;
