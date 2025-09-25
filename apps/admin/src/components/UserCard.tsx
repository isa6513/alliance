import { GroupDto, User } from "@alliance/shared/client/types.gen";
import { getApiUrl } from "@alliance/shared/lib/config";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { Duration, formatDuration, intervalToDuration } from "date-fns";
import { useNavigate } from "react-router";
import Badge from "@alliance/shared/ui/Badge";
import { useOutsideClick } from "@alliance/shared/lib/useOutsideClick";
import { useMemo, useState } from "react";
import DropdownIcon from "@alliance/shared/ui/icons/DropdownIcon";

const UserCard = ({
  user,
  timeSpent,
  timeSpentTotal,
  groups,
  allGroups,
  onToggleGroup,
  isGroupPending,
}: {
  user: User;
  timeSpent: number;
  timeSpentTotal: number;
  groups: GroupDto[];
  allGroups: GroupDto[];
  onToggleGroup: (
    groupId: number,
    nextChecked: boolean
  ) => void | Promise<void>;
  isGroupPending: (groupId: number) => boolean;
}) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useOutsideClick(() => setIsDropdownOpen(false));

  const sortedAllGroups = useMemo(() => {
    return [...allGroups].sort((a, b) => a.name.localeCompare(b.name));
  }, [allGroups]);

  const groupIds = useMemo(
    () => new Set(groups.map((group) => group.id)),
    [groups]
  );

  const formatTime = (time: number) => {
    const interval = intervalToDuration({ start: 0, end: time * 1000 });
    const formatUnits: (keyof Duration)[] =
      interval.minutes || interval.hours || interval.days
        ? ["hours", "minutes"]
        : ["hours", "minutes", "seconds"];
    return formatDuration(interval, {
      format: formatUnits,
    })
      .replace(" hours", "h")
      .replace(" minutes", "m")
      .replace(" seconds", "s");
  };

  const time = formatTime(timeSpent);
  const timeTotal = formatTime(timeSpentTotal);

  const contractStatusColor = user.contractDateSuspended
    ? "text-red-500"
    : user.contractDateSigned
    ? "text-green"
    : "text-zinc-500";

  const contractStatus = user.contractDateSuspended
    ? "Suspended"
    : user.contractDateSigned
    ? "Signed"
    : "Not signed";

  return (
    <Card
      style={CardStyle.White}
      className="min-w-[300px] text-sm"
      onClick={() => navigate(`/database/?table=user&id=${user.id}`)}
    >
      <div className="flex flex-row items-center gap-x-3 border-b pb-2 mb-2 border-zinc-200">
        <ProfileImage
          pfp={
            user.profilePicture
              ? getApiUrl() + "/images/" + user.profilePicture
              : null
          }
          size="large"
        />
        <p className="text-base">{user.name}</p>
      </div>
      <div className="flex flex-row items-center border-b pb-2 mb-2 border-zinc-200">
        <p>
          Contract status:{" "}
          <span className={`font-medium ${contractStatusColor}`}>
            {contractStatus}
          </span>
        </p>
      </div>
      <div className="border-b pb-2 mb-2 border-zinc-200">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Groups</p>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              onClick={(event) => {
                event.stopPropagation();
                setIsDropdownOpen((open) => !open);
              }}
            >
              Manage
              <DropdownIcon size="mini" fill="#2563eb" />
            </button>
            {isDropdownOpen && (
              <div
                className="absolute right-0 z-20 mt-2 w-56 rounded border border-zinc-200 bg-white shadow"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="max-h-56 overflow-y-auto py-1">
                  {sortedAllGroups.length ? (
                    sortedAllGroups.map((group) => {
                      const checked = groupIds.has(group.id);
                      const pending = isGroupPending(group.id);
                      return (
                        <label
                          key={group.id}
                          className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 ${
                            pending ? "opacity-60" : ""
                          }`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="cursor-pointer"
                            checked={checked}
                            disabled={pending}
                            onChange={(event) => {
                              event.stopPropagation();
                              onToggleGroup(group.id, !checked);
                            }}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-700">
                              {group.name}
                            </span>
                            <span className="text-xs text-zinc-500 truncate max-w-[180px]">
                              {group.description}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <p className="px-3 py-2 text-sm text-zinc-500">
                      No groups available
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {groups.length ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {groups.map((group) => (
              <Badge key={group.id}>{group.name}</Badge>
            ))}
          </div>
        ) : null}
      </div>
      <div>
        <p className="font-semibold ">Activity</p>
        <div className="flex flex-row justify-between ">
          <p className="text-zinc-500">Last 7 days</p>
          <p className={`${!time && "text-zinc-500"}`}>{time || "0"}</p>
        </div>
        <div className="flex flex-row justify-between ">
          <p className="text-zinc-500">Total</p>
          <p className={`${!timeTotal && "text-zinc-500"}`}>
            {timeTotal || "0"}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;
