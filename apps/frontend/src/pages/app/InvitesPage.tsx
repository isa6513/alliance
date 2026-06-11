import { OnetimeInviteDto } from "@alliance/shared/client";
import { MEMBER_GOAL } from "@alliance/shared/lib/constants";
import {
  deleteInviteConfirmation,
  inviteBuckets,
} from "@alliance/shared/lib/copy";
import { bucketOnetimeInvitesByActionability } from "@alliance/shared/lib/inviteUtils";
import { useAllianceMemberCount } from "@alliance/shared/lib/useAllianceMemberCount";
import { useOnetimeInvitesOverview } from "@alliance/shared/lib/useOnetimeInvitesOverview";
import { getLeaderCommunityIds } from "@alliance/shared/lib/userUtils";
import { getBaseUrl } from "@alliance/sharedweb/lib/config";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import InfoTooltip from "@alliance/sharedweb/ui/InfoTooltip";
import List from "@alliance/sharedweb/ui/List";
import Spinner from "@alliance/sharedweb/ui/Spinner";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";
import { UserCheck } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import InviteForm from "../../components/InviteForm";
import OnetimeInviteListItem from "../../components/OnetimeInviteListItem";
import { useAuth } from "../../lib/AuthContext";

const InvitesPage = () => {
  const { user } = useAuth();
  const { error: errorToast, confirm } = useToast();
  const {
    invites,
    isLoading: loadingInvites,
    isError,
    upsertInvite,
    approveInvite,
    rejectInvite,
    deleteInvite,
  } = useOnetimeInvitesOverview({ enabled: Boolean(user) });
  const [copiedInviteId, setCopiedInviteId] = useState<number | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const leaderCommunityIds = useMemo(
    () => getLeaderCommunityIds(user ?? undefined),
    [user],
  );

  const { actionable, unverifiableActionable, waitingForResponse, settled } =
    useMemo(() => {
      if (!user) {
        return {
          actionable: [],
          unverifiableActionable: [],
          waitingForResponse: [],
          settled: [],
        };
      }
      return bucketOnetimeInvitesByActionability({
        invites,
        leaderCommunityIds,
        userId: user.id,
      });
    }, [invites, leaderCommunityIds, user]);

  const acceptedInvites = useMemo(() => {
    return invites.filter((invite) => invite.status === "link_used");
  }, [invites]);

  const copyToClipboard = useCallback((text: string) => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/signup?ref=${text}`;
    navigator.clipboard.writeText(url);
  }, []);

  const handleCopied = useCallback((inviteId: number) => {
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }
    setCopiedInviteId(inviteId);
    copiedTimeoutRef.current = setTimeout(() => {
      setCopiedInviteId(null);
      copiedTimeoutRef.current = null;
    }, 2000);
  }, []);

  const handleApproveInvite = useCallback(
    (inviteId: number) => {
      void approveInvite(inviteId).catch((err: Error) => {
        errorToast(`Failed to approve invite: ${err.message}`);
      });
    },
    [approveInvite, errorToast],
  );

  const handleRejectInvite = useCallback(
    (inviteId: number) => {
      void rejectInvite(inviteId).catch((err: Error) => {
        errorToast(`Failed to reject invite: ${err.message}`);
      });
    },
    [rejectInvite, errorToast],
  );

  const handleDeleteInvite = useCallback(
    (inviteId: number, event: React.MouseEvent<HTMLElement>) => {
      void (async () => {
        const ok = await confirm({
          message: deleteInviteConfirmation.message,
          confirmLabel: deleteInviteConfirmation.confirmLabel,
          cancelLabel: deleteInviteConfirmation.cancelLabel,
          anchorEl: event.currentTarget,
          placement: "topleft",
        });
        if (!ok) {
          return;
        }

        await deleteInvite(inviteId).catch(() => {});
      })();
    },
    [confirm, deleteInvite],
  );

  const handleDeleteRequest = useCallback(
    (inviteId: number) => {
      void deleteInvite(inviteId).catch(() => {});
    },
    [deleteInvite],
  );

  const handleInviteCreated = useCallback(
    (invite: OnetimeInviteDto) => {
      upsertInvite(invite);
    },
    [upsertInvite],
  );

  const { data: allianceMemberCount, isPending: allianceMemberCountPending } =
    useAllianceMemberCount({ enabled: Boolean(user) });

  const allianceProgressPercent = useMemo(() => {
    const n = allianceMemberCount ?? 0;
    return Math.min(100, (n / MEMBER_GOAL) * 100);
  }, [allianceMemberCount]);

  if (!user || loadingInvites) {
    return <Spinner />;
  }

  return (
    <CenterLayout>
      <div className="flex flex-col gap-y-12">
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-4">
            <h1 className="text-title">Invites</h1>
            <div className="w-full flex flex-row items-center gap-x-6">
              <div className="flex-1 rounded flex flex-col gap-y-1 min-w-0">
                <p className="leading-snug text-zinc-500 text-sm flex flex-row items-center gap-x-1">
                  Help the Alliance reach its current growth goal
                  <InfoTooltip
                    content="The office sets regular growth goals so that the Alliance can test processes and actions at progressively larger scales."
                    size={12}
                  />
                </p>
                <div className="flex flex-col gap-y-1">
                  <div className="w-full h-4 bg-grey-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green rounded-full transition-[width] duration-300 ease-out"
                      style={{ width: `${allianceProgressPercent}%` }}
                      role="progressbar"
                      aria-valuenow={allianceMemberCount ?? 0}
                      aria-valuemin={0}
                      aria-valuemax={MEMBER_GOAL}
                      aria-label="Alliance members toward growth goal"
                    />
                  </div>
                  <p className="text-sm sm:text-base tabular-nums">
                    <span className="font-semibold text-green">
                      {allianceMemberCountPending
                        ? "…"
                        : (allianceMemberCount ?? 0).toLocaleString()}
                    </span>
                    <span className="text-zinc-500">
                      {" "}
                      / {MEMBER_GOAL.toLocaleString()} members
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-row items-center gap-x-2 bg-white rounded p-4">
                <UserCheck className="w-10 h-10 bg-green/10 rounded p-2 text-green" />
                <div>
                  <p className="font-semibold text-black text-lg sm:text-xl">
                    {acceptedInvites.length}
                  </p>
                  <p className="leading-none text-zinc-500 text-sm sm:text-base">
                    Accepted invites
                  </p>
                </div>
              </div>
            </div>
          </div>

          <InviteForm onInviteCreated={handleInviteCreated} />
          {isError && (
            <p className="text-red-500 text-sm">Failed to load invites</p>
          )}
        </div>

        {actionable.length === 0 &&
          unverifiableActionable.length === 0 &&
          waitingForResponse.length === 0 &&
          settled.length === 0 && (
            <p className="text-zinc-500 text-center text-base sm:text-lg">
              Your invites will appear here once you create them.
            </p>
          )}

        {actionable.length > 0 && (
          <div className="flex flex-col gap-y-4">
            <p className="font-semibold text-2xl">
              {inviteBuckets.actionable.title}
            </p>
            <List>
              {actionable.map((request) => (
                <OnetimeInviteListItem
                  key={request.id}
                  invite={request}
                  showCommunityLabel={true}
                  communityLabel={request.community?.name}
                  selfInvited={user.id === request.invitingUser?.id}
                  onApprove={handleApproveInvite}
                  onReject={handleRejectInvite}
                />
              ))}
            </List>
          </div>
        )}

        {unverifiableActionable.length > 0 && (
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-1">
              <p className="font-semibold text-2xl">
                {inviteBuckets.unverifiableActionable.title}
              </p>
              <p className="text-zinc-500">
                {inviteBuckets.unverifiableActionable.description}
              </p>
            </div>
            <List>
              {unverifiableActionable.map((invite) => (
                <OnetimeInviteListItem
                  key={invite.id}
                  invite={invite}
                  showCommunityLabel={true}
                  communityLabel={invite.community?.name}
                  selfInvited={user.id === invite.invitingUser?.id}
                  copied={copiedInviteId === invite.id}
                  onDelete={handleDeleteInvite}
                  onCopy={copyToClipboard}
                  onCopied={handleCopied}
                />
              ))}
            </List>
          </div>
        )}

        {waitingForResponse.length > 0 && (
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-1">
              <p className="font-semibold text-2xl">
                {inviteBuckets.waitingForResponse.title}
              </p>
              <p className="text-zinc-500">
                {inviteBuckets.waitingForResponse.description}
              </p>
            </div>
            <List>
              {waitingForResponse.map((request) => (
                <OnetimeInviteListItem
                  key={request.id}
                  invite={request}
                  showCommunityLabel={true}
                  communityLabel={request.community?.name}
                  selfInvited={user.id === request.invitingUser?.id}
                  onDelete={(inviteId) => handleDeleteRequest(inviteId)}
                />
              ))}
            </List>
          </div>
        )}

        {settled.length > 0 && (
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-1">
              <p className="font-semibold text-2xl">
                {inviteBuckets.settled.title}
              </p>
              <p className="text-zinc-500">
                {inviteBuckets.settled.description}
              </p>
            </div>
            <List>
              {settled.map((invite) => (
                <OnetimeInviteListItem
                  key={invite.id}
                  invite={invite}
                  showCommunityLabel={true}
                  communityLabel={invite.community?.name}
                  selfInvited={user.id === invite.invitingUser?.id}
                  copied={copiedInviteId === invite.id}
                  onCopy={copyToClipboard}
                  onCopied={handleCopied}
                />
              ))}
            </List>
          </div>
        )}
      </div>
    </CenterLayout>
  );
};

export default InvitesPage;
