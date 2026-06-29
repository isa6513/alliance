import { actionsGetUnwelcomedSignedContractMembersAdmin } from "@alliance/shared/client";
import type { UnwelcomedSignedContractMemberDto } from "@alliance/shared/client/types.gen";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const WelcomeQueuePage: React.FC = () => {
  const [members, setMembers] = useState<UnwelcomedSignedContractMemberDto[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    actionsGetUnwelcomedSignedContractMembersAdmin()
      .then((response) => {
        setMembers(response.data ?? []);
      })
      .catch((err: unknown) => {
        console.error("Failed to load welcome queue", err);
        setError("Unable to load members who need welcomes.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const sortedMembers = useMemo(
    () =>
      [...members].sort(
        (a, b) =>
          new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime(),
      ),
    [members],
  );

  return (
    <div className="p-5 space-y-4">
      <title>Welcome Queue - Admin</title>
      <div>
        <h1 className="text-lg font-bold text-zinc-900">Welcome Queue</h1>
        <p className="text-sm text-zinc-600 mt-1 max-w-3xl">
          We welcome every user by leaving a comment on their signed contract
          action. This list shows signed members whose contract completion has
          not received a comment yet.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-800">
            {loading
              ? "Loading members..."
              : `${sortedMembers.length} member${
                  sortedMembers.length === 1 ? "" : "s"
                } need${sortedMembers.length === 1 ? "s" : ""} a welcome`}
          </p>
        </div>

        {!loading && sortedMembers.length === 0 && !error ? (
          <p className="px-4 py-8 text-sm text-zinc-500">
            Everyone who has signed their membership contract has a welcome
            comment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-100 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium text-zinc-600">
                    Member
                  </th>
                  <th className="px-4 py-2 font-medium text-zinc-600">
                    Signed
                  </th>
                  <th className="px-4 py-2 font-medium text-zinc-600">
                    Completed
                  </th>
                  <th className="px-4 py-2 font-medium text-zinc-600">
                    Links
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sortedMembers.map((entry) => (
                  <tr key={entry.activityId} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AvatarProfile pfp={entry.user.profilePicture} />
                        <div>
                          <Link
                            to={`/member/${entry.user.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {entry.user.displayName}
                          </Link>
                          <p className="text-xs text-zinc-500">
                            ID: {entry.user.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(entry.signedAt)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(entry.completedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/actions/${entry.actionId}`}
                          className="text-blue-600 hover:underline"
                        >
                          Contract action
                        </Link>
                        <span className="text-zinc-500">
                          Activity #{entry.activityId}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td className="px-4 py-8 text-sm text-zinc-500" colSpan={4}>
                      Loading members...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeQueuePage;
