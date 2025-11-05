import { NotificationPlan, ReminderGroup } from "@alliance/shared/client";
import Card from "@alliance/shared/ui/Card";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import TextareaWithHighlights from "./TextareaWithHighlights";
import { ActionEventDto } from "@alliance/shared/client";
import { UserSelectUser } from "./UserSelect";
import { GroupDto } from "@alliance/shared/client";
import { ActionEventNotifDto } from "@alliance/shared/client";
import ActionReminderGroupForm, {
  ActionReminderGroupFormSubmitPayload,
} from "./ActionReminderGroupForm";
import DatabaseIcon from "@alliance/shared/ui/icons/DatabaseIcon";
import { Link } from "react-router";
import { formatDate } from "date-fns";
import { useRef, useState } from "react";
import DropdownIcon from "@alliance/shared/ui/icons/DropdownIcon";

interface ActionReminderCardProps {
  group: ReminderGroup;
  highlightedReminder: number | undefined;
  ref: React.RefObject<HTMLDivElement | null>;
  handleDeleteGroup: (
    groupId: number,
    anchor?: HTMLElement | null
  ) => Promise<void>;
  groupSchedule: { primary: string; secondary?: string | null };
  editing: boolean;
  handleEditCancel: () => void;
  handleEditGroupStart: (groupId: number) => void;
  selectedEventId: number | null;
  memberEvents: ActionEventDto[];
  users: UserSelectUser[];
  loadingUsers: boolean;
  userGroups: GroupDto[];
  loadingUserGroups: boolean;
  userGroupsError: string | null;
  editSubmitting: boolean;
  editError: string | null;
  editSuccess: string | null;
  handleEditGroupSubmit: (
    groupId: number
  ) => (payload: ActionReminderGroupFormSubmitPayload) => Promise<void>;
  setShowReminderPlans: React.Dispatch<React.SetStateAction<number | null>>;
  showReminderPlans: number | null;
  setShowSentReminders: React.Dispatch<React.SetStateAction<number | null>>;
  showSentReminders: number | null;
  reminderPlans: NotificationPlan[];
  sentReminders: ActionEventNotifDto[];
}
const ActionReminderCard = ({
  group,
  highlightedReminder,
  ref,
  groupSchedule,
  editing,
  handleEditCancel,
  handleEditGroupStart,
  handleDeleteGroup,
  selectedEventId,
  memberEvents,
  users,
  loadingUsers,
  userGroups,
  loadingUserGroups,
  userGroupsError,
  editSubmitting,
  editError,
  editSuccess,
  handleEditGroupSubmit,
  setShowReminderPlans,
  showReminderPlans,
  setShowSentReminders,
  showSentReminders,
  reminderPlans,
  sentReminders,
}: ActionReminderCardProps) => {
  const [minified, setMinified] = useState(true);

  const handleEditGroup = () => {
    setMinified(false);
    handleEditGroupStart(group.id);
  };

  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Card
      key={group.id}
      ref={highlightedReminder === group.id ? ref : undefined}
      className={`bg-white text-sm !p-0 overflow-hidden transition-all duration-300 ${
        highlightedReminder === group.id ? "!border-red-500" : ""
      }`}
    >
      <div className="flex flex-row gap-2 w-full bg-zinc-100 p-4 items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          <Button
            type="button"
            color={ButtonColor.Transparent}
            onClick={() => setMinified(!minified)}
            className={`-my-1 transition-transform duration-100 ${
              minified ? "rotate-180" : ""
            }`}
          >
            <DropdownIcon size="small" fill="black" />
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-2">
              <p className="font-semibold">{group.name}</p>
              <p className="">{groupSchedule.primary}</p>
            </div>
            {groupSchedule.secondary && (
              <p className="text-xs text-gray-500">{groupSchedule.secondary}</p>
            )}
            {group.allSent && (
              <p className="text-green">All reminders processed</p>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-2">
          {editing ? (
            <Button
              type="button"
              color={ButtonColor.White}
              onClick={handleEditCancel}
              className="-my-1"
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              color={ButtonColor.White}
              onClick={handleEditGroup}
              className="-my-1"
            >
              Edit
            </Button>
          )}
          <Button
            type="button"
            color={ButtonColor.Black}
            onClick={() => handleDeleteGroup(group.id, deleteButtonRef.current)}
            className="-my-1"
            ref={deleteButtonRef}
          >
            Delete
          </Button>
        </div>
      </div>
      <div className={`${minified ? "hidden" : ""}`}>
        <div className={`flex flex-row gap-2 p-4`}>
          {editing && selectedEventId !== null ? (
            <ActionReminderGroupForm
              memberEvents={memberEvents}
              users={users}
              loadingUsers={loadingUsers}
              userGroups={userGroups}
              loadingUserGroups={loadingUserGroups}
              userGroupsError={userGroupsError}
              submitting={editSubmitting}
              initialValues={{
                memberActionEventId: selectedEventId,
                reminderGroup: group,
                users: group.users ?? [],
              }}
              serverError={editError}
              serverSuccess={editSuccess}
              submitLabel="Update Reminders"
              onCancel={handleEditCancel}
              onSubmit={handleEditGroupSubmit(group.id)}
            />
          ) : (
            <>
              <div className="flex flex-col gap-1 w-1/2">
                <p className="text-sm font-semibold text-gray-900">
                  {group.emailSubject}
                </p>
                <TextareaWithHighlights
                  value={group.emailMessage}
                  editable={false}
                  onChange={() => {}}
                  keywords={[]}
                />
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <p className="text-xs font-semibold">Text message:</p>
                <p>{group.textMessage}</p>
              </div>
            </>
          )}
        </div>
        <div>
          <div className="flex flex-row gap-2">
            <p
              className="text-sm cursor-pointer ml-4 mb-4 text-blue"
              onClick={() =>
                setShowReminderPlans((prev) =>
                  prev === group.id ? null : group.id
                )
              }
            >
              {showReminderPlans === group.id
                ? "Hide reminder plans"
                : "Show reminder plans"}
            </p>
            <p
              className="text-sm cursor-pointer ml-4 mb-4 text-green"
              onClick={() =>
                setShowSentReminders((prev) =>
                  prev === group.id ? null : group.id
                )
              }
            >
              {showSentReminders === group.id
                ? "Hide sent reminders"
                : "Show sent reminders"}
            </p>
          </div>
          <div
            className={`divide-y divide-gray-200 border-t border-gray-200 
                    overflow-y-auto transition-[max-height] duration-300 ${
                      showReminderPlans === group.id
                        ? "max-h-[300px]"
                        : "max-h-[0px]"
                    }`}
          >
            {reminderPlans.map((plan) => (
              <div
                key={plan.user.id}
                className="p-3 flex flex-row gap-2 items-center"
              >
                <Link to={`/member/${plan.user.id}`} target="_blank">
                  {plan.user.name}
                </Link>
                <p className="text-xs text-gray-500">
                  {formatDate(plan.scheduledFor, "MM/dd/yyyy hh:mm a")}
                </p>
              </div>
            ))}
            {reminderPlans.length === 0 && (
              <p className="text-sm text-zinc-500 p-5">No reminder plans</p>
            )}
          </div>
          <div
            className={`divide-y divide-gray-200 border-t border-gray-200 
                    overflow-y-auto transition-[max-height] duration-300 ${
                      showSentReminders === group.id
                        ? "max-h-[300px]"
                        : "max-h-[0px]"
                    }`}
          >
            {sentReminders.map((notif) => (
              <div
                key={notif.id}
                className="p-3 flex flex-row gap-2 items-center"
              >
                <p className="text-zinc-500">({notif.channel})</p>
                <Link to={`/member/${notif.user.id}`} target="_blank">
                  {notif.user.displayName}
                </Link>
                <p className="text-sm text-zinc-500">
                  {formatDate(notif.createdAt, "MM/dd/yyyy hh:mm a")}
                </p>
                <Link
                  to={`/database?table=action_event_notif&id=${notif.id}`}
                  target="_blank"
                >
                  <DatabaseIcon size="small" fill="gray" />
                </Link>
              </div>
            ))}
            {sentReminders.length === 0 && (
              <p className="text-sm text-zinc-500 p-5">No sent reminders</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ActionReminderCard;
