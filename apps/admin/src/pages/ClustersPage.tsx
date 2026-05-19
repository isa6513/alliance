import {
  clusterListAdmin,
  clusterReassignAll,
  clusterUpdateAdmin,
} from "@alliance/shared/client";
import type { ClusterAdminDto } from "@alliance/shared/client/types.gen";
import { CardStyle } from "@alliance/shared/styles/card";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import Card from "@alliance/sharedweb/ui/Card";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";
import { Pencil } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import ConfirmDialog from "../components/ConfirmDialog";

const ClustersPage: React.FC = () => {
  const [clusters, setClusters] = useState<ClusterAdminDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [reassigning, setReassigning] = useState<boolean>(false);
  const { success, error: toastError } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await clusterListAdmin();
      setClusters(response.data ?? []);
    } catch (err) {
      console.error("Failed to load clusters", err);
      setError("Unable to load clusters.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleReassign = useCallback(async () => {
    setReassigning(true);
    try {
      const response = await clusterReassignAll();
      const r = response.data;
      if (r) {
        success(
          `Reassigned ${r.usersAssigned} member${
            r.usersAssigned === 1 ? "" : "s"
          } into ${r.clustersCreated} cluster${
            r.clustersCreated === 1 ? "" : "s"
          }.`,
        );
      }
      setConfirmOpen(false);
      await load();
    } catch (err) {
      console.error("Failed to reassign clusters", err);
      toastError("Reassign failed.");
    } finally {
      setReassigning(false);
    }
  }, [load, success, toastError]);

  const totalMembers = clusters.reduce((acc, c) => acc + c.members.length, 0);

  return (
    <div className="h-full p-5 pt-20 flex flex-col items-center gap-y-4">
      <title>Clusters - Admin</title>
      <div className="w-full max-w-5xl flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Clusters</h2>
            <p className="text-sm text-zinc-500">
              Friend-disjoint groupings of signed members, used for matching.
            </p>
          </div>
          <Button
            color={ButtonColor.Red}
            onClick={() => setConfirmOpen(true)}
            disabled={loading || reassigning}
          >
            Reassign all
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Card style={CardStyle.White}>
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium text-zinc-700">
              {clusters.length} cluster{clusters.length === 1 ? "" : "s"}
            </p>
            <p className="text-zinc-500">
              {totalMembers} member{totalMembers === 1 ? "" : "s"} placed
            </p>
          </div>
        </Card>

        {loading ? (
          <p className="text-sm text-zinc-500">Loading clusters…</p>
        ) : clusters.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No clusters yet. Click &quot;Reassign all&quot; to generate them
            from currently-signed members.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {clusters.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                onRenamed={(updated) =>
                  setClusters((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c)),
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Reassign all clusters?"
        message={
          "This wipes every existing cluster and re-clusters every member with an active signed contract from scratch. Members will likely end up in different clusters than they're in now."
        }
        confirmText="Reassign all"
        cancelText="Cancel"
        isLoading={reassigning}
        onConfirm={handleReassign}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

type ClusterCardProps = {
  cluster: ClusterAdminDto;
  onRenamed: (cluster: ClusterAdminDto) => void;
};

const ClusterCard: React.FC<ClusterCardProps> = ({ cluster, onRenamed }) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [draftName, setDraftName] = useState<string>(cluster.displayName);
  const [saving, setSaving] = useState<boolean>(false);
  const { error: toastError } = useToast();

  const startEdit = () => {
    setDraftName(cluster.displayName);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraftName(cluster.displayName);
  };

  const save = async () => {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === cluster.displayName) {
      cancelEdit();
      return;
    }
    setSaving(true);
    try {
      const response = await clusterUpdateAdmin({
        path: { id: cluster.id },
        body: { displayName: trimmed },
      });
      if (response.data) {
        onRenamed(response.data);
      }
      setEditing(false);
    } catch (err) {
      console.error("Failed to rename cluster", err);
      toastError("Could not rename cluster.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={CardStyle.White}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between gap-3">
          {editing ? (
            <div className="flex flex-row items-center gap-2 flex-1">
              <input
                type="text"
                autoFocus
                className="border border-zinc-300 rounded px-2 py-1 text-base font-semibold flex-1 max-w-sm"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void save();
                  else if (e.key === "Escape") cancelEdit();
                }}
                disabled={saving}
              />
              <Button
                color={ButtonColor.Blue}
                onClick={save}
                disabled={saving}
                className="!px-3 !py-1 text-sm"
              >
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                color={ButtonColor.Transparent}
                onClick={cancelEdit}
                disabled={saving}
                className="!px-3 !py-1 text-sm"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex flex-row items-center gap-2">
              <h3 className="text-base font-semibold">{cluster.displayName}</h3>
              <button
                type="button"
                onClick={startEdit}
                className="text-zinc-400 hover:text-zinc-700"
                aria-label="Rename cluster"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
          <p className="text-sm text-zinc-500">
            {cluster.members.length} member
            {cluster.members.length === 1 ? "" : "s"}
          </p>
        </div>

        {cluster.members.length === 0 ? (
          <p className="text-sm text-zinc-400 italic">No members</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {cluster.members.map((m) => (
              <Link
                key={m.id}
                to={`/member/${m.id}`}
                className="flex flex-row items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 pl-1 pr-3 py-1 text-sm"
              >
                <AvatarProfile pfp={m.profilePicture ?? null} size="small" />
                <span>{m.displayName}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ClustersPage;
