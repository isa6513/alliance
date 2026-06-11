import {
  RequestOnetimeInviteDto,
  userRequestOnetimeInvite,
} from "@alliance/shared/client";
import {
  deleteInviteConfirmation,
  inviteBuckets,
} from "@alliance/shared/lib/copy";
import { useOnetimeInvitesOverview } from "@alliance/shared/lib/useOnetimeInvitesOverview";
import { getBaseUrl } from "@alliance/sharedweb/lib/config";
import List from "@alliance/sharedweb/ui/List";
import Spinner from "@alliance/sharedweb/ui/Spinner";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";
import { useMemo, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import OnetimeInviteForm from "./OnetimeInviteForm";
import OnetimeInviteListItem from "./OnetimeInviteListItem";

function createdAtComparator(
  a: { createdAt: string },
  b: { createdAt: string },
) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

type CommunityInvitesMemberTabProps = {
  communityId: number;
};

const CommunityInvitesMemberTab = ({
  communityId,
}: CommunityInvitesMemberTabProps) => {
  const { user } = useAuth();
  const { error: errorToast, confirm } = useToast();
  const {
    invites,
    isLoading: loadingInvites,
    refresh,
    deleteInvite,
  } = useOnetimeInvitesOverview({ enabled: !!user });

  const [creatingInvite, setCreatingInvite] = useState(false);
  const [inviteeName, setInviteeName] = useState("");
  const [inviteeDescription, setInviteeDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const myInvitesForCommunity = useMemo(() => {
    if (!user) {
      return [];
    }
    return invites.filter(
      (invite) =>
        invite.community?.id === communityId &&
        invite.invitingUser?.id === user.id,
    );
  }, [communityId, invites, user]);

  const invitesRequiresUnverifiableAction = useMemo(
    () =>
      myInvitesForCommunity
        .filter((invite) => invite.status === "link_unused")
        .sort(createdAtComparator),
    [myInvitesForCommunity],
  );

  const invitesWaitingForResponse = useMemo(
    () =>
      myInvitesForCommunity
        .filter((invite) => invite.status === "request_pending")
        .sort(createdAtComparator),
    [myInvitesForCommunity],
  );

  const invitesSettled = useMemo(
    () =>
      myInvitesForCommunity
        .filter(
          (invite) =>
            invite.status === "request_rejected" ||
            invite.status === "link_used",
        )
        .sort(createdAtComparator),
    [myInvitesForCommunity],
  );

  const copyToClipboard = (code: string) => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/signup?ref=${code}`;
    navigator.clipboard.writeText(url);
  };

  const handleRequestInvite = () => {
    if (!user) {
      return;
    }
    setCreatingInvite(true);
    const body = {
      invitee: inviteeName,
      inviteeDescription: inviteeDescription || undefined,
      communityId,
    } satisfies RequestOnetimeInviteDto;

    void (async () => {
      const response = await userRequestOnetimeInvite({ body });
      if (response.data) {
        setInviteeName("");
        setInviteeDescription("");
        setError(null);
        void refresh();
      } else {
        setError("Failed to request invite");
      }
      setCreatingInvite(false);
    })();
  };

  const handleDeleteInvite = (
    inviteId: number,
    event: React.MouseEvent<HTMLElement>,
  ) => {
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

      void deleteInvite(inviteId).catch(() => {});
    })();
  };

  const handleCancelRequest = (inviteId: number) => {
    void deleteInvite(inviteId).catch((e) => {
      errorToast(
        e instanceof Error ? e.message : "Failed to cancel invite request",
      );
    });
  };

  if (!user || loadingInvites) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col gap-y-8 py-4 px-2 md:px-0">
      <div className="flex flex-col gap-y-3">
        <p className="font-semibold text-xl md:text-2xl">Request an invite</p>
        <OnetimeInviteForm
          inviteeName={inviteeName}
          setInviteeName={setInviteeName}
          info={inviteeDescription}
          setInfo={setInviteeDescription}
          creatingInvite={creatingInvite}
          onSubmit={handleRequestInvite}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {invitesRequiresUnverifiableAction.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <p className="font-semibold text-xl">Invites to be sent</p>
          <List>
            {invitesRequiresUnverifiableAction.map((invite) => (
              <OnetimeInviteListItem
                key={invite.id}
                invite={invite}
                selfInvited={true}
                onDelete={handleDeleteInvite}
                onCopy={copyToClipboard}
              />
            ))}
          </List>
        </div>
      )}

      {invitesWaitingForResponse.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <p className="font-semibold text-xl">Waiting on response</p>
          <List>
            {invitesWaitingForResponse.map((request) => (
              <OnetimeInviteListItem
                key={request.id}
                invite={request}
                selfInvited={true}
                onDelete={handleCancelRequest}
              />
            ))}
          </List>
        </div>
      )}

      {invitesSettled.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <p className="font-semibold text-xl">{inviteBuckets.settled.title}</p>
          <List>
            {invitesSettled.map((invite) => (
              <OnetimeInviteListItem
                key={invite.id}
                invite={invite}
                selfInvited={true}
                onCopy={copyToClipboard}
              />
            ))}
          </List>
        </div>
      )}
    </div>
  );
};

export default CommunityInvitesMemberTab;
