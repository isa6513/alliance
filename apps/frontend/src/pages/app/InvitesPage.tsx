import {
  OnetimeInviteDto,
  userApproveOnetimeInvite,
  userDeleteOnetimeInvite,
  userGetOnetimeInvitesOverview,
  userNmembers,
  userRejectOnetimeInvite,
} from "@alliance/shared/client";
import { MEMBER_GOAL } from "@alliance/shared/lib/constants";
import List from "@alliance/sharedweb/ui/List";
import Spinner from "@alliance/sharedweb/ui/Spinner";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import { getBaseUrl } from "@alliance/sharedweb/lib/config";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";
import OnetimeInviteListItem from "../../components/OnetimeInviteListItem";
import { bucketOnetimeInvitesByActionability } from "@alliance/shared/lib/inviteUtils";
import { getLeaderCommunityIds } from "@alliance/shared/lib/userUtils";
import {
  inviteBuckets,
  deleteInviteConfirmation,
} from "@alliance/shared/lib/copy";
import InviteForm from "../../components/InviteForm";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import { UserCheck } from "lucide-react";
import InfoTooltip from "@alliance/sharedweb/ui/InfoTooltip";

const InvitesPage = () => {
  const { user } = useAuth();
  const { error: errorToast, confirm } = useToast();
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<OnetimeInviteDto[]>([]);
  const [copiedInviteId, setCopiedInviteId] = useState<number | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void (async () => {
      setLoadingInvites(true);
      const response = await userGetOnetimeInvitesOverview();
      if (response.data) {
        setInvites(response.data);
        setError(null);
      } else {
        setError("Failed to load invites");
      }
      setLoadingInvites(false);
    })();
  }, []);

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
      void (async () => {
        const response = await userApproveOnetimeInvite({
          path: { inviteId },
        });
        if (!response.data) {
          errorToast(
            `Failed to approve invite: ${response.response.statusText}`,
          );
          return;
        }

        setInvites((prev) =>
          prev.map((invite) =>
            invite.id === inviteId ? response.data : invite,
          ),
        );
      })();
    },
    [errorToast],
  );

  const handleRejectInvite = useCallback(
    (inviteId: number) => {
      void (async () => {
        const response = await userRejectOnetimeInvite({
          path: { inviteId },
        });

        if (response.error) {
          errorToast(
            `Failed to reject invite: ${response.response.statusText}`,
          );
          return;
        }

        setInvites((prev) => prev.filter((request) => request.id !== inviteId));
      })();
    },
    [errorToast],
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

        const response = await userDeleteOnetimeInvite({ path: { inviteId } });
        if (!response.error) {
          setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
        }
      })();
    },
    [confirm],
  );

  const handleDeleteRequest = useCallback((inviteId: number) => {
    void (async () => {
      const response = await userDeleteOnetimeInvite({ path: { inviteId } });
      if (!response.error) {
        setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
      }
    })();
  }, []);

  const handleInviteCreated = useCallback((invite: OnetimeInviteDto) => {
    setInvites((prev) => [invite, ...prev]);
  }, []);

  const { data: allianceMemberCount, isPending: allianceMemberCountPending } =
    useQuery({
      queryKey: ["userNmembers"],
      queryFn: () => userNmembers().then((res) => res.data?.count ?? 0),
      enabled: Boolean(user),
    });

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
          {error && <p className="text-red-500 text-sm">{error}</p>}
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
