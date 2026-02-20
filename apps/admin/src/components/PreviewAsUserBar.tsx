import type { UserDto } from "@alliance/shared/client";

export interface PreviewAsUserBarProps {
  previewUserId: string;
  setPreviewUserId: (value: string) => void;
  previewUsers: UserDto[];
  isLoadingPreviewUsers: boolean;
  previewUserError: string | null;
  onRefreshUsers: () => void;
}

export function PreviewAsUserBar({
  previewUserId,
  setPreviewUserId,
  previewUsers,
  isLoadingPreviewUsers,
  previewUserError,
  onRefreshUsers,
}: PreviewAsUserBarProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Preview as</span>
        <select
          value={previewUserId}
          onChange={(event) => setPreviewUserId(event.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="preview">Preview user</option>
          {previewUsers.map((user) => (
            <option key={user.id} value={String(user.id)}>
              {user.name ?? `User #${user.id}`}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {isLoadingPreviewUsers && <span>Loading users…</span>}
        {previewUserError && (
          <span className="text-red-600">{previewUserError}</span>
        )}
        <button
          type="button"
          className="text-blue-600 hover:text-blue-700"
          onClick={() => void onRefreshUsers()}
        >
          Refresh users
        </button>
      </div>
    </div>
  );
}
