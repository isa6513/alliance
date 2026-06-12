import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AddUserToTagDto,
  CreateTagDto,
  userAddUserToTag,
  userCreateTag,
  userDeleteTag,
  userGetTags,
  userRemoveUserFromTag,
  userUpdateTag,
} from "../client";
import { queryKeys } from "./queryKeys";

const QUERY_KEY = queryKeys.tagsAdmin();

/**
 * Single source of truth for tags — wraps `userGetTags` and the
 * create/update/delete/membership endpoints in react-query, sharing one cache
 * key that every mutation invalidates.
 */
export function useTagsAdmin(params?: { enabled?: boolean }) {
  const { enabled = true } = params ?? {};
  const queryClient = useQueryClient();

  const {
    data: tags = [],
    // a disabled query is permanently pending
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () =>
      userGetTags({ throwOnError: true }).then((response) => response.data),
    enabled,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const createTag = useMutation({
    mutationFn: (body: CreateTagDto) =>
      userCreateTag({ body, throwOnError: true }).then((r) => r.data),
    onSuccess: invalidate,
  });

  const updateTag = useMutation({
    mutationFn: ({ tagId, body }: { tagId: string; body: CreateTagDto }) =>
      userUpdateTag({ path: { tagId }, body, throwOnError: true }).then(
        (r) => r.data,
      ),
    onSuccess: invalidate,
  });

  const deleteTag = useMutation({
    mutationFn: (tagId: string) =>
      userDeleteTag({ path: { tagId }, throwOnError: true }).then(
        (r) => r.data,
      ),
    onSuccess: invalidate,
  });

  const addUserToTag = useMutation({
    mutationFn: ({ tagId, body }: { tagId: string; body: AddUserToTagDto }) =>
      userAddUserToTag({ path: { tagId }, body, throwOnError: true }).then(
        (r) => r.data,
      ),
    onSuccess: invalidate,
  });

  const removeUserFromTag = useMutation({
    mutationFn: ({ tagId, body }: { tagId: string; body: AddUserToTagDto }) =>
      userRemoveUserFromTag({ path: { tagId }, body, throwOnError: true }).then(
        (r) => r.data,
      ),
    onSuccess: invalidate,
  });

  return {
    tags,
    isLoading,
    isError,
    refetch,
    createTag,
    updateTag,
    deleteTag,
    addUserToTag,
    removeUserFromTag,
  };
}
