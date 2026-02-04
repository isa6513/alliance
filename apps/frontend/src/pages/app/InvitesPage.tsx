import {
  OnetimeInviteDto,
  userApproveOnetimeInvite,
  userDeleteOnetimeInvite,
  userGetOnetimeInvitesOverview,
  userRejectOnetimeInvite,
} from "@alliance/shared/client";
import List from "@alliance/sharedweb/ui/List";
import Spinner from "@alliance/sharedweb/ui/Spinner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import { getBaseUrl } from "@alliance/sharedweb/lib/config";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";
import OnetimeInviteListItem from "../../components/OnetimeInviteListItem";
import { bucketOnetimeInvitesByActionability } from "@alliance/shared/lib/inviteUtils";
import {
  inviteBuckets,
  deleteInviteConfirmation,
} from "@alliance/shared/lib/copy";
import InviteForm from "../../components/InviteForm";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";

const InvitesPage = () => {
  const { user } = useAuth();
  const { error: errorToast, confirm } = useToast();
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<OnetimeInviteDto[]>([]);

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

  const leaderCommunityIds = useMemo(() => {
    if (!user) {
      return new Set<number>();
    }
    return new Set(
      user.communities
        .filter(
          (community) =>
            community.leaders?.some((leader) => leader.id === user.id) ?? false
        )
        .map((community) => community.id)
    );
  }, [user]);

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

  const handleApproveInvite = useCallback(
    (inviteId: number) => {
      void (async () => {
        const response = await userApproveOnetimeInvite({
          path: { inviteId },
        });
        if (!response.data) {
          errorToast(
            `Failed to approve invite: ${response.response.statusText}`
          );
          return;
        }

        setInvites((prev) =>
          prev.map((invite) =>
            invite.id === inviteId ? response.data : invite
          )
        );
      })();
    },
    [errorToast]
  );

  const handleRejectInvite = useCallback(
    (inviteId: number) => {
      void (async () => {
        const response = await userRejectOnetimeInvite({
          path: { inviteId },
        });

        if (response.error) {
          errorToast(
            `Failed to reject invite: ${response.response.statusText}`
          );
          return;
        }

        setInvites((prev) => prev.filter((request) => request.id !== inviteId));
      })();
    },
    [errorToast]
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
    [confirm]
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

  if (!user || loadingInvites) {
    return <Spinner />;
  }

  return (
    <CenterLayout>
      <div className="flex flex-col gap-y-12">
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-row justify-between items-center gap-x-2">
            <p className="font-serif font-semibold text-2xl md:text-3xl">
              Invites
            </p>
            {acceptedInvites.length > 0 && (
              <p className="text-zinc-500 text-base sm:text-lg">
                Accepted invites:{" "}
                <span className="font-semibold text-black">
                  {acceptedInvites.length}
                </span>
              </p>
            )}
          </div>

          {<InviteForm onInviteCreated={handleInviteCreated} />}
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
          <div className="flex flex-col gap-y-2">
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
          <div className="flex flex-col gap-y-2">
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
                  onDelete={handleDeleteInvite}
                  onCopy={copyToClipboard}
                />
              ))}
            </List>
          </div>
        )}

        {waitingForResponse.length > 0 && (
          <div className="flex flex-col gap-y-2">
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
          <div className="flex flex-col gap-y-2">
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
                  onCopy={copyToClipboard}
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
