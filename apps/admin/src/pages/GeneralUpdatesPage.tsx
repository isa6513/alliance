import {
  actionsAllGeneralUpdates,
  GeneralUpdateDto,
} from "@alliance/shared/client";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

const GeneralUpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<GeneralUpdateDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadUpdates = useCallback(async () => {
    try {
      const response = await actionsAllGeneralUpdates();
      if (response.data) {
        setUpdates(response.data);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to load general updates");
      setLoading(false);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  if (loading) {
    return <p className="p-5">Loading general updates...</p>;
  }

  if (error) {
    return <p className="p-5 text-red-500">{error}</p>;
  }

  if (updates.length === 0) {
    return (
      <div className="p-5 space-y-4">
        <title>General Updates - Admin</title>
        <p className="font-bold text-lg">General Updates</p>
        <p className="text-zinc-500">No general updates found.</p>
      </div>
    );
  }

  const now = new Date();

  const activeUpdates = updates.filter((u) => {
    const start = u.startDate ? new Date(u.startDate) : null;
    const end = u.endDate ? new Date(u.endDate) : null;
    const started = !start || start <= now;
    const notEnded = !end || end > now;
    return started && notEnded;
  });

  const scheduledUpdates = updates.filter((u) => {
    const start = u.startDate ? new Date(u.startDate) : null;
    return start && start > now;
  });

  const expiredUpdates = updates.filter((u) => {
    const end = u.endDate ? new Date(u.endDate) : null;
    return end && end <= now;
  });

  const groups = [
    { label: "Active", items: activeUpdates },
    { label: "Scheduled", items: scheduledUpdates },
    { label: "Expired", items: expiredUpdates },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4 p-5">
      <title>General Updates - Admin</title>
      <p className="font-bold text-lg">General Updates</p>
      <p className="text-sm text-zinc-500">
        {updates.length} total update{updates.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-x-2 mb-2">
              <div className="h-px bg-zinc-300 flex-1" />
              <p className="text-xs font-bold uppercase text-zinc-700">
                {group.label}
              </p>
              <div className="h-px bg-zinc-300 flex-1" />
            </div>
            <div className="border border-zinc-200 rounded-lg overflow-hidden divide-y divide-zinc-200">
              {group.items.map((update) => (
                <GeneralUpdateCard
                  key={update.id}
                  update={update}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const GeneralUpdateCard: React.FC<{
  update: GeneralUpdateDto;
  navigate: ReturnType<typeof useNavigate>;
}> = ({ update, navigate }) => {
  const now = new Date();
  const start = update.startDate ? new Date(update.startDate) : null;
  const end = update.endDate ? new Date(update.endDate) : null;
  const isActive = (!start || start <= now) && (!end || end > now);
  const isExpired = end && end <= now;

  return (
    <div
      className="p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
      onClick={() => navigate(`/database?table=general_update&id=${update.id}`)}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-y-1">
          <h2 className="font-bold text-sm">{update.name}</h2>
          <div className="flex items-center gap-x-3 text-xs text-zinc-500">
            <span>Start: {formatDate(update.startDate)}</span>
            <span>End: {formatDate(update.endDate)}</span>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-sm border ${
            isExpired
              ? "bg-zinc-100 border-zinc-300 text-zinc-600"
              : isActive
              ? "bg-green/20 border-zinc-200 text-zinc-800"
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}
        >
          {isExpired ? "Expired" : isActive ? "Active" : "Scheduled"}
        </span>
      </div>
    </div>
  );
};

export default GeneralUpdatesPage;
