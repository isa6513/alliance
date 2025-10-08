import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  userCreateGroup,
  userDeleteGroup,
  userGetGroups,
  userUpdateGroup,
} from "@alliance/shared/client";
import { CreateGroupDto, GroupDto } from "@alliance/shared/client/types.gen";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Badge from "@alliance/shared/ui/Badge";
import { Link } from "react-router";

const INITIAL_NEW_GROUP = {
  name: "",
  description: "",
  publicDisplayName: "",
};

const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState<CreateGroupDto>(INITIAL_NEW_GROUP);
  const [creating, setCreating] = useState(false);
  const [updatingGroups, setUpdatingGroups] = useState<Set<number>>(
    () => new Set()
  );
  const [deletingGroups, setDeletingGroups] = useState<Set<number>>(
    () => new Set()
  );

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userGetGroups();
      if (res.data) {
        setGroups(res.data);
      }
    } catch (err) {
      console.error("Failed to load groups", err);
      setError("Failed to load groups. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => a.name.localeCompare(b.name));
  }, [groups]);

  const handleCreateGroup = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const name = newGroup.name.trim();
      const description = newGroup.description.trim();
      const publicDisplayName = newGroup.publicDisplayName?.trim();
      if (!name || !description) {
        setError("Name and description are required.");
        return;
      }
      setCreating(true);
      setError(null);
      try {
        const res = await userCreateGroup({
          body: {
            name,
            description,
            publicDisplayName: publicDisplayName || undefined,
          },
        });
        if (res.data) {
          setGroups((prev) => [...prev, res.data]);
          setNewGroup(INITIAL_NEW_GROUP);
        }
      } catch (err) {
        console.error("Failed to create group", err);
        setError("Unable to create group. Please try again.");
      } finally {
        setCreating(false);
      }
    },
    [newGroup]
  );

  const handleUpdateGroup = useCallback(
    async (groupId: number, values: CreateGroupDto) => {
      setUpdatingGroups((prev) => {
        const next = new Set(prev);
        next.add(groupId);
        return next;
      });
      setError(null);
      try {
        const res = await userUpdateGroup({
          path: { groupId },
          body: {
            name: values.name.trim(),
            description: values.description.trim(),
            publicDisplayName: values.publicDisplayName?.trim() || undefined,
          },
        });
        if (res.data) {
          setGroups((prev) =>
            prev.map((group) => (group.id === res.data.id ? res.data : group))
          );
          return true;
        }
      } catch (err) {
        console.error("Failed to update group", err);
        setError("Unable to update group. Please try again.");
      } finally {
        setUpdatingGroups((prev) => {
          const next = new Set(prev);
          next.delete(groupId);
          return next;
        });
      }
      return false;
    },
    []
  );

  const handleDeleteGroup = useCallback(async (groupId: number) => {
    setDeletingGroups((prev) => {
      const next = new Set(prev);
      next.add(groupId);
      return next;
    });
    setError(null);
    try {
      await userDeleteGroup({
        path: { groupId },
      });
      setGroups((prev) => prev.filter((group) => group.id !== groupId));
      return true;
    } catch (err) {
      console.error("Failed to delete group", err);
      setError("Unable to delete group. Please try again.");
    } finally {
      setDeletingGroups((prev) => {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });
    }
    return false;
  }, []);

  return (
    <div className="h-full p-5 pt-20 flex flex-col items-center gap-y-4">
      {error && (
        <div className="w-full">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <div className="w-full max-w-4xl flex flex-col gap-3">
        <div className="w-full flex flex-row items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Group management</h2>
          <Link to="/members" className="text-sm text-blue-600 hover:underline">
            Back to members
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading groups...</p>
        ) : sortedGroups.length ? (
          sortedGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onSave={(values) => handleUpdateGroup(group.id, values)}
              onDelete={() => handleDeleteGroup(group.id)}
              isUpdating={updatingGroups.has(group.id)}
              isDeleting={deletingGroups.has(group.id)}
            />
          ))
        ) : (
          <p className="text-sm text-zinc-500">No groups yet.</p>
        )}
      </div>
      <Card className="w-full max-w-4xl" style={CardStyle.White}>
        <p className="font-bold mb-4">Create group</p>
        <form className="flex flex-col gap-3" onSubmit={handleCreateGroup}>
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium text-zinc-700"
              htmlFor="group-name"
            >
              Group name
            </label>
            <input
              id="group-name"
              type="text"
              className="border border-zinc-300 rounded px-3 py-2 text-sm"
              value={newGroup.name}
              onChange={(event) => {
                setError(null);
                setNewGroup((prev) => ({
                  ...prev,
                  name: event.target.value,
                }));
              }}
              placeholder="Group name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium text-zinc-700"
              htmlFor="group-display-name"
            >
              Public display name (optional)
            </label>
            <input
              id="group-display-name"
              type="text"
              className="border border-zinc-300 rounded px-3 py-2 text-sm"
              value={newGroup.publicDisplayName}
              onChange={(event) => {
                setError(null);
                setNewGroup((prev) => ({
                  ...prev,
                  publicDisplayName: event.target.value,
                }));
              }}
              placeholder="Community team"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium text-zinc-700"
              htmlFor="group-description"
            >
              Description
            </label>
            <textarea
              id="group-description"
              className="border border-zinc-300 rounded px-3 py-2 text-sm min-h-[80px]"
              value={newGroup.description}
              onChange={(event) => {
                setError(null);
                setNewGroup((prev) => ({
                  ...prev,
                  description: event.target.value,
                }));
              }}
              placeholder="What is this group responsible for?"
            />
          </div>
          <Button
            type="submit"
            color={ButtonColor.Blue}
            className="self-start"
            disabled={creating}
          >
            {creating ? "Creating..." : "Create group"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

type GroupCardProps = {
  group: GroupDto;
  onSave: (values: CreateGroupDto) => Promise<boolean> | boolean;
  onDelete: () => Promise<boolean> | boolean;
  isUpdating: boolean;
  isDeleting: boolean;
};

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onSave,
  onDelete,
  isUpdating,
  isDeleting,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<CreateGroupDto>({
    name: group.name,
    description: group.description,
    publicDisplayName: group.publicDisplayName ?? "",
  });

  useEffect(() => {
    setFormValues({
      name: group.name,
      description: group.description,
      publicDisplayName: group.publicDisplayName ?? "",
    });
  }, [group]);

  const memberCount = group.users.length;

  const handleSave = async () => {
    const result = await onSave(formValues);
    if (result) {
      setIsEditing(false);
    }
  };

  const confirmAndDelete = async () => {
    const confirmed = window.confirm(
      `Delete group "${group.name}"? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }
    const result = await onDelete();
    if (result) {
      setIsEditing(false);
    }
  };

  return (
    <Card className="w-full" style={CardStyle.White}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center gap-3">
              <h3 className="text-lg font-semibold">{group.name}</h3>
              <Badge>
                {memberCount} member{memberCount === 1 ? "" : "s"}
              </Badge>
            </div>
            {group.publicDisplayName && !isEditing && (
              <p className="text-sm text-zinc-500">
                Public name: {group.publicDisplayName}
              </p>
            )}
          </div>
          <div className="flex flex-row gap-2">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  color={ButtonColor.Light}
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  color={ButtonColor.Blue}
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  color={ButtonColor.White}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  color={ButtonColor.RedOutline}
                  onClick={confirmAndDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </>
            )}
          </div>
        </div>
        {isEditing ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">Name</label>
              <input
                type="text"
                className="border border-zinc-300 rounded px-3 py-2 text-sm"
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                Public display name (optional)
              </label>
              <input
                type="text"
                className="border border-zinc-300 rounded px-3 py-2 text-sm"
                value={formValues.publicDisplayName}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    publicDisplayName: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                Description
              </label>
              <textarea
                className="border border-zinc-300 rounded px-3 py-2 text-sm min-h-[80px]"
                value={formValues.description}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">
              {group.description}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GroupManagement;
