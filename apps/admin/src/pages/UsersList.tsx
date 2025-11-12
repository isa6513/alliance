import {
  analyticsGetTimeSpentPerUser,
  analyticsGetTimeSpentPerUserTotal,
  userAddUserToGroup,
  userGetGroups,
  userList,
  userActionRelations as userGetActionRelations,
  userRemoveUserFromGroup,
} from "@alliance/shared/client";
import {
  GroupDto,
  TimeSpentForUserDto,
  UserActionRelationDetailDto,
  UserActionRelationsResponseDto,
  UserActionSummaryDto,
  UserDto,
} from "@alliance/shared/client/types.gen";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import UserCard from "../components/UserCard";
import DropdownSelect from "@alliance/shared/ui/DropdownSelect";
import { useOutsideClick } from "@alliance/shared/lib/useOutsideClick";
import { Link } from "react-router";

const USER_FILTER_MODES = ["All", "Signed", "Suspended", "Not signed"] as const;
type UserFilterMode = (typeof USER_FILTER_MODES)[number];

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [timeSpentPerUserLast7, setTimeSpentPerUserLast7] = useState<
    TimeSpentForUserDto[]
  >([]);
  const [timeSpentPerUserTotal, setTimeSpentPerUserTotal] = useState<
    TimeSpentForUserDto[]
  >([]);
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [actionSummaries, setActionSummaries] = useState<
    UserActionSummaryDto[]
  >([]);
  const [userActionRelations, setUserActionRelations] = useState<
    Record<number, UserActionRelationDetailDto[]>
  >({});
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [filterMode, setFilterMode] = useState<UserFilterMode>("All");
  const [isGroupFilterOpen, setIsGroupFilterOpen] = useState(false);
  const groupDropdownRef = useOutsideClick(() => setIsGroupFilterOpen(false));
  const filterModeOptions = useMemo(() => Array.from(USER_FILTER_MODES), []);
  const [pendingGroupOps, setPendingGroupOps] = useState<Set<string>>(
    () => new Set()
  );
  const [groupMutationError, setGroupMutationError] = useState<string | null>(
    null
  );

  useEffect(() => {
    analyticsGetTimeSpentPerUser().then((res) => {
      if (res.data) {
        setTimeSpentPerUserLast7(res.data);
      }
    });
    analyticsGetTimeSpentPerUserTotal().then((res) => {
      if (res.data) {
        setTimeSpentPerUserTotal(res.data);
      }
    });
  }, []);

  useEffect(() => {
    userList().then((res) => setUsers(res.data || []));
  }, []);

  useEffect(() => {
    userGetGroups().then((res) => setGroups(res.data || []));
  }, []);

  useEffect(() => {
    userGetActionRelations().then((res) => {
      const data: UserActionRelationsResponseDto | undefined = res.data;
      if (!data) {
        return;
      }
      setActionSummaries(data.actions ?? []);
      const relationMap: Record<number, UserActionRelationDetailDto[]> = {};
      for (const entry of data.users ?? []) {
        relationMap[entry.userId] = entry.relations ?? [];
      }
      setUserActionRelations(relationMap);
    });
  }, []);

  const userToTimeSpent = useMemo(() => {
    return timeSpentPerUserLast7.reduce((acc, time) => {
      acc[time.userId] = time.timeSpent;
      return acc;
    }, {} as Record<number, number>);
  }, [timeSpentPerUserLast7]);

  const userToTimeSpentTotal = useMemo(() => {
    return timeSpentPerUserTotal.reduce((acc, time) => {
      acc[time.userId] = time.timeSpent;
      return acc;
    }, {} as Record<number, number>);
  }, [timeSpentPerUserTotal]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      return (
        (userToTimeSpentTotal[b.id] ?? 0) - (userToTimeSpentTotal[a.id] ?? 0)
      );
    });
  }, [users, userToTimeSpentTotal]);

  const userGroupsMap = useMemo(() => {
    return groups.reduce((acc, group) => {
      group.users.forEach((profile) => {
        if (!acc[profile.id]) {
          acc[profile.id] = [];
        }
        acc[profile.id].push(group);
      });
      return acc;
    }, {} as Record<number, GroupDto[]>);
  }, [groups]);

  const filteredByGroups = useMemo(() => {
    if (!selectedGroupIds.length) {
      return sortedUsers;
    }
    const selected = new Set(selectedGroupIds);
    return sortedUsers.filter((user) => {
      const userGroups = userGroupsMap[user.id] || [];
      return userGroups.some((group) => selected.has(group.id));
    });
  }, [selectedGroupIds, sortedUsers, userGroupsMap]);

  const modeToUsers = useMemo(() => {
    return USER_FILTER_MODES.reduce((acc, mode) => {
      acc[mode] = filteredByGroups.filter((user) => {
        if (mode === "All") return true;
        if (mode === "Signed") return user.contractDateSigned;
        if (mode === "Suspended") return user.contractDateSuspended;
        return !user.contractDateSigned;
      });
      return acc;
    }, {} as Record<UserFilterMode, UserDto[]>);
  }, [filteredByGroups]);

  const selectedGroupNames = useMemo(() => {
    if (!selectedGroupIds.length) return [] as string[];
    const selected = new Set(selectedGroupIds);
    return groups
      .filter((group) => selected.has(group.id))
      .map((group) => group.name);
  }, [groups, selectedGroupIds]);

  const groupFilterLabel = useMemo(() => {
    if (!selectedGroupIds.length) {
      return "All groups";
    }
    if (selectedGroupIds.length === 1) {
      return selectedGroupNames[0] ?? "1 group";
    }
    return `${selectedGroupIds.length} groups`;
  }, [selectedGroupIds, selectedGroupNames]);

  const toggleGroupSelection = (groupId: number) => {
    setSelectedGroupIds((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId);
      }
      return [...prev, groupId];
    });
  };

  const clearGroupSelection = () => {
    setSelectedGroupIds([]);
  };

  const noteForLocalhost =
    typeof window !== "undefined" && window.location.href.includes("localhost");

  const updateGroupInState = useCallback((updatedGroup: GroupDto) => {
    setGroups((prev) => {
      const groupExists = prev.some((group) => group.id === updatedGroup.id);
      if (groupExists) {
        return prev.map((group) =>
          group.id === updatedGroup.id ? updatedGroup : group
        );
      }
      return [...prev, updatedGroup];
    });
  }, []);

  const handleUserGroupToggle = useCallback(
    async (userId: number, groupId: number, nextChecked: boolean) => {
      const key = `${userId}-${groupId}`;
      setPendingGroupOps((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      setGroupMutationError(null);
      try {
        if (nextChecked) {
          const res = await userAddUserToGroup({
            path: { groupId },
            body: { userId },
          });
          if (res.data) {
            updateGroupInState(res.data);
          }
        } else {
          const res = await userRemoveUserFromGroup({
            path: { groupId },
            body: { userId },
          });
          if (res.data) {
            updateGroupInState(res.data);
          }
        }
      } catch (error) {
        console.error("Failed to update group membership", error);
        setGroupMutationError("Failed to update group membership. Try again.");
      } finally {
        setPendingGroupOps((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [updateGroupInState]
  );

  return (
    <div className="h-full p-5 pt-20 flex flex-col items-center gap-y-3 overflow-x-hidden">
      <div className="flex flex-row gap-3 w-full items-center">
        <div className="flex flex-row gap-3 items-center">
          <DropdownSelect
            options={filterModeOptions}
            secondaryLabels={filterModeOptions.map((mode) =>
              (modeToUsers[mode as UserFilterMode]?.length ?? 0).toString()
            )}
            value={filterMode}
            onChange={(mode) => setFilterMode(mode as UserFilterMode)}
          />
          <div className="relative" ref={groupDropdownRef}>
            <button
              type="button"
              className="font-ibm text-sm border border-gray-2 text-black bg-white hover:bg-zinc-50 px-3 rounded-sm py-2 flex flex-row gap-x-2 items-center"
              style={{ fontWeight: 450 }}
              onClick={() => setIsGroupFilterOpen((open) => !open)}
            >
              <span>{groupFilterLabel}</span>
            </button>
            {isGroupFilterOpen && (
              <div className="absolute z-10 top-[calc(100%+4px)] left-0 min-w-[220px] bg-white border border-zinc-200 rounded shadow">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200">
                  <p className="text-sm font-medium text-zinc-600">Groups</p>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={clearGroupSelection}
                  >
                    Clear
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {groups.length ? (
                    groups.map((group) => {
                      const checked = selectedGroupIds.includes(group.id);
                      const memberCount = group.users.length;
                      return (
                        <label
                          key={group.id}
                          className="flex flex-row items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="cursor-pointer"
                            checked={checked}
                            onChange={() => toggleGroupSelection(group.id)}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{group.name}</span>
                            <span className="text-xs text-zinc-500">
                              {memberCount} member{memberCount === 1 ? "" : "s"}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <p className="px-3 py-2 text-sm text-zinc-500">
                      No groups yet
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/members/groups"
            className="text-sm text-blue-600 hover:underline"
          >
            Manage groups
          </Link>
          {noteForLocalhost && (
            <p className="text-sm text-gray-500">
              note: activity data is prod-only
            </p>
          )}
        </div>
      </div>
      {groupMutationError && (
        <div className="w-full">
          <p className="text-sm text-red-500">{groupMutationError}</p>
        </div>
      )}
      <div className="grid gap-3 w-full [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {(modeToUsers[filterMode] ?? []).map((user) => (
          <UserCard
            key={user.id}
            user={user}
            timeSpent={userToTimeSpent[user.id]}
            timeSpentTotal={userToTimeSpentTotal[user.id]}
            groups={userGroupsMap[user.id] || []}
            allGroups={groups}
            onToggleGroup={(groupId, nextChecked) =>
              handleUserGroupToggle(user.id, groupId, nextChecked)
            }
            isGroupPending={(groupId) =>
              pendingGroupOps.has(`${user.id}-${groupId}`)
            }
            actions={actionSummaries}
            actionRelations={userActionRelations[user.id] || []}
          />
        ))}
      </div>
    </div>
  );
};

export default UsersList;
