import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  userCreateTag,
  userDeleteTag,
  userGetTags,
  userUpdateTag,
} from "@alliance/shared/client";
import { CreateTagDto, TagDto } from "@alliance/shared/client/types.gen";
import Card from "@alliance/sharedweb/ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import Badge from "@alliance/sharedweb/ui/Badge";
import { Link } from "react-router";

const INITIAL_NEW_TAG = {
  name: "",
  description: "",
  publicDisplayName: "",
};

const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<TagDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState<CreateTagDto>(INITIAL_NEW_TAG);
  const [creating, setCreating] = useState(false);
  const [updatingTags, setUpdatingTags] = useState<Set<string>>(
    () => new Set()
  );
  const [deletingTags, setDeletingTags] = useState<Set<string>>(
    () => new Set()
  );

  const loadTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userGetTags();
      if (res.data) {
        setTags(res.data);
      }
    } catch (err) {
      console.error("Failed to load tags", err);
      setError("Failed to load tags. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTags();
  }, [loadTags]);

  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) => a.name.localeCompare(b.name));
  }, [tags]);

  const handleCreateGroup = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const name = newTag.name.trim();
      const description = newTag.description.trim();
      const publicDisplayName = newTag.publicDisplayName?.trim();
      if (!name || !description) {
        setError("Name and description are required.");
        return;
      }
      setCreating(true);
      setError(null);
      try {
        const res = await userCreateTag({
          body: {
            name,
            description,
            publicDisplayName: publicDisplayName || undefined,
          },
        });
        if (res.data) {
          setTags((prev) => [...prev, res.data]);
          setNewTag(INITIAL_NEW_TAG);
        }
      } catch (err) {
        console.error("Failed to create tag", err);
        setError("Unable to create tag. Please try again.");
      } finally {
        setCreating(false);
      }
    },
    [newTag]
  );

  const handleUpdateTag = useCallback(
    async (tagId: string, values: CreateTagDto) => {
      setUpdatingTags((prev) => {
        const next = new Set(prev);
        next.add(tagId);
        return next;
      });
      setError(null);
      try {
        const res = await userUpdateTag({
          path: { tagId },
          body: {
            name: values.name.trim(),
            description: values.description.trim(),
            publicDisplayName: values.publicDisplayName?.trim() || undefined,
          },
        });
        if (res.data) {
          setTags((prev) =>
            prev.map((tag) => (tag.id === res.data.id ? res.data : tag))
          );
          return true;
        }
      } catch (err) {
        console.error("Failed to update tag", err);
        setError("Unable to update tag. Please try again.");
      } finally {
        setUpdatingTags((prev) => {
          const next = new Set(prev);
          next.delete(tagId);
          return next;
        });
      }
      return false;
    },
    []
  );

  const handleDeleteTag = useCallback(async (tagId: string) => {
    setDeletingTags((prev) => {
      const next = new Set(prev);
      next.add(tagId);
      return next;
    });
    setError(null);
    try {
      await userDeleteTag({
        path: { tagId },
      });
      setTags((prev) => prev.filter((tag) => tag.id !== tagId));
      return true;
    } catch (err) {
      console.error("Failed to delete tag", err);
      setError("Unable to delete tag. Please try again.");
    } finally {
      setDeletingTags((prev) => {
        const next = new Set(prev);
        next.delete(tagId);
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
          <h2 className="text-2xl font-semibold">Tags</h2>
          <Link to="/members" className="text-sm text-blue-600 hover:underline">
            Back to members
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading groups...</p>
        ) : sortedTags.length ? (
          sortedTags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              onSave={(values) => handleUpdateTag(tag.id, values)}
              onDelete={() => handleDeleteTag(tag.id)}
              isUpdating={updatingTags.has(tag.id)}
              isDeleting={deletingTags.has(tag.id)}
            />
          ))
        ) : (
          <p className="text-sm text-zinc-500">No tags yet.</p>
        )}
      </div>
      <Card className="w-full max-w-4xl" style={CardStyle.White}>
        <p className="font-bold mb-4">Create tag</p>
        <form className="flex flex-col gap-3" onSubmit={handleCreateGroup}>
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium text-zinc-700"
              htmlFor="tag-name"
            >
              Tag name
            </label>
            <input
              id="tag-name"
              type="text"
              className="border border-zinc-300 rounded px-3 py-2 text-sm"
              value={newTag.name}
              onChange={(event) => {
                setError(null);
                setNewTag((prev) => ({
                  ...prev,
                  name: event.target.value,
                }));
              }}
              placeholder="Tag name"
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
              value={newTag.description}
              onChange={(event) => {
                setError(null);
                setNewTag((prev) => ({
                  ...prev,
                  description: event.target.value,
                }));
              }}
              placeholder="What is this tag responsible for?"
            />
          </div>
          <Button
            type="submit"
            color={ButtonColor.Blue}
            className="self-start"
            disabled={creating}
          >
            {creating ? "Creating..." : "Create tag"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

type TagCardProps = {
  tag: TagDto;
  onSave: (values: CreateTagDto) => Promise<boolean> | boolean;
  onDelete: () => Promise<boolean> | boolean;
  isUpdating: boolean;
  isDeleting: boolean;
};

const TagCard: React.FC<TagCardProps> = ({
  tag,
  onSave,
  onDelete,
  isUpdating,
  isDeleting,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<CreateTagDto>({
    name: tag.name,
    description: tag.description,
    publicDisplayName: tag.publicDisplayName ?? "",
  });

  useEffect(() => {
    setFormValues({
      name: tag.name,
      description: tag.description,
      publicDisplayName: tag.publicDisplayName ?? "",
    });
  }, [tag]);

  const memberCount = tag.users.length;

  const handleSave = async () => {
    const result = await onSave(formValues);
    if (result) {
      setIsEditing(false);
    }
  };

  const confirmAndDelete = async () => {
    const confirmed = window.confirm(
      `Delete tag "${tag.name}"? This cannot be undone.`
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
              <h3 className="font-semibold">{tag.name}</h3>
              <Badge>
                {memberCount} member{memberCount === 1 ? "" : "s"}
              </Badge>
            </div>
            {tag.publicDisplayName && !isEditing && (
              <p className="text-sm text-zinc-500">
                Public name: {tag.publicDisplayName}
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
                  color={ButtonColor.Light}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  color={ButtonColor.Red}
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
              {tag.description}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TagManagement;
