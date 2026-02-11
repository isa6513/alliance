import {
  communityCreateCommunityInvite,
  communityDeleteCommunityInvite,
  CommunityInviteDto,
  CreateOnetimeInviteDto,
  OnetimeInviteDto,
  ProfileDto,
  userCreateOnetimeInvite,
  userDeleteOnetimeInvite,
  userGetCommunityInvites,
  userGetOnetimeInvitesByCommunity,
  userApproveOnetimeInvite,
  userRejectOnetimeInvite,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import List from "@alliance/sharedweb/ui/List";
import { getBaseUrl } from "@alliance/sharedweb/lib/config";
import UserSelect, {
  UserSelectUser,
  useSelectableUserIds,
} from "@alliance/sharedweb/ui/UserSelect";
import DropdownSelect from "@alliance/sharedweb/ui/DropdownSelect";
import Card from "@alliance/sharedweb/ui/Card";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";
import { CardStyle } from "@alliance/shared/styles/card";
import CommunityInviteListItem from "./CommunityInviteListItem";
import OnetimeInviteListItem from "./OnetimeInviteListItem";
import OnetimeInviteForm from "./OnetimeInviteForm";
import {
  bucketOnetimeInvitesByActionability,
  bucketCommunityInvitesByActionability,
} from "@alliance/shared/lib/inviteUtils";
import {
  inviteBuckets,
  deleteInviteConfirmation,
} from "@alliance/shared/lib/copy";

export interface CommunityInvitesLeaderTabProps {
  communityId: number;
  existingMembers: ProfileDto[];
  setInviteNotifCount: (count: number) => void;
}

export enum InviteMode {
  NewMember = "New Alliance member",
  CurrentMember = "Current Alliance member",
}

const CommunityInvitesLeaderTab = ({
  communityId,
  existingMembers,
  setInviteNotifCount,
}: CommunityInvitesLeaderTabProps) => {
  const [name, setName] = useState("");
  const { user } = useAuth();

  const [creatingInvite, setCreatingInvite] = useState(false);

  const [onetimeInvites, setOnetimeInvites] = useState<OnetimeInviteDto[]>([]);
  const [communityInvites, setCommunityInvites] = useState<
    CommunityInviteDto[]
  >([]);
  const { error: errorToast, confirm } = useToast();

  const allUsers = useSelectableUserIds();

  const selectableUsers = useMemo(
    () =>
      allUsers.filter(
        (user) =>
          !existingMembers.some((member) => member.id === user.id) &&
          !communityInvites
            .filter((invite) => invite.status === "invitee_pending")
            .some((invite) => invite.invitedUser?.id === user.id)
      ),
    [allUsers, existingMembers, communityInvites]
  );

  const [selectedUser, setSelectedUser] = useState<UserSelectUser | null>(null);

  const [inviteMode, setInviteMode] = useState<InviteMode>(
    InviteMode.NewMember
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userGetOnetimeInvitesByCommunity({ path: { communityId } }).then(
      (response) => {
        if (response.data) {
          setOnetimeInvites(response.data);
        } else {
          setError("Failed to load new member invites");
        }
      }
    );
    userGetCommunityInvites({ path: { communityId } }).then((response) => {
      if (response.data) {
        setCommunityInvites(response.data);
      } else {
        setError("Failed to load existing member invites");
      }
    });
  }, [communityId]);

  const leaderCommunityIds = useMemo(() => {
    return new Set([communityId]);
  }, [communityId]);

  const {
    actionable: onetimeActionable,
    unverifiableActionable: onetimeUnverifiableActionable,
    waitingForResponse: onetimeWaitingForResponse,
    settled: onetimeSettled,
  } = useMemo(() => {
    if (!user) {
      return {
        actionable: [],
        unverifiableActionable: [],
        waitingForResponse: [],
        settled: [],
      };
    }
    return bucketOnetimeInvitesByActionability({
      invites: onetimeInvites,
      leaderCommunityIds,
      userId: user.id,
    });
  }, [onetimeInvites, leaderCommunityIds, user]);

  const {
    actionable: communityActionable,
    waitingForResponse: communityWaitingForResponse,
    settled: communitySettled,
  } = useMemo(() => {
    if (!user) {
      return {
        actionable: [],
        waitingForResponse: [],
        settled: [],
      };
    }
    return bucketCommunityInvitesByActionability({
      invites: communityInvites,
      userId: user.id,
    });
  }, [communityInvites, user]);

  useEffect(() => {
    setInviteNotifCount(onetimeActionable.length);
  }, [onetimeActionable.length, setInviteNotifCount]);

  const copyToClipboard = (text: string) => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/signup?ref=${text}`;
    navigator.clipboard.writeText(url);
  };

  const handleInvite = () => {
    if (!user) {
      return;
    }
    setCreatingInvite(true);
    const body = {
      invitee: name,
      communityId,
      invitingUserId: user.id,
    } satisfies CreateOnetimeInviteDto;

    userCreateOnetimeInvite({ body })
      .then((response) => {
        if (response.data) {
          setName("");
          setOnetimeInvites((prev) => [response.data, ...prev]);
          setError(null);
        }
      })
      .finally(() => {
        setCreatingInvite(false);
      });
  };

  const handleInviteExistingMember = () => {
    if (!selectedUser) {
      return;
    }
    setCreatingInvite(true);
    communityCreateCommunityInvite({
      body: { invitedUserId: selectedUser.id, communityId },
    })
      .then((response) => {
        if (response.data) {
          setCommunityInvites((prev) => [response.data, ...prev]);
          setSelectedUser(null);
          setError(null);
        } else {
          setError(
            (response.error as Error).message ?? "Failed to invite user"
          );
        }
      })
      .finally(() => {
        setCreatingInvite(false);
      });
  };

  const onApproveOnetimeInvite = (inviteId: number) => {
    (async () => {
      const response = await userApproveOnetimeInvite({
        path: { inviteId },
      });
      if (!response.data) {
        errorToast(`Failed to approve invite: ${response.response.statusText}`);
        return;
      }

      setOnetimeInvites((prev) =>
        prev.map((invite) => (invite.id === inviteId ? response.data : invite))
      );
    })();
  };

  const onRejectOnetimeInvite = (inviteId: number) => {
    (async () => {
      const response = await userRejectOnetimeInvite({
        path: { inviteId },
      });

      if (response.error) {
        errorToast(`Failed to reject invite: ${response.response.statusText}`);
        return;
      }

      setOnetimeInvites((prev) =>
        prev.filter((invite) => invite.id !== inviteId)
      );
    })();
  };

  const handleDeleteInvite = (
    inviteId: number,
    event: React.MouseEvent<HTMLElement>
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

      userDeleteOnetimeInvite({ path: { inviteId } }).then((response) => {
        if (!response.error) {
          setOnetimeInvites((prev) =>
            prev.filter((invite) => invite.id !== inviteId)
          );
        }
      });
    })();
  };

  const handleDeleteCommunityInvite = (inviteId: number) => {
    communityDeleteCommunityInvite({ path: { inviteId } }).then((response) => {
      if (response.data) {
        setCommunityInvites((prev) =>
          prev.filter((invite) => invite.id !== inviteId)
        );
      }
    });
  };

  return (
    <div className="flex flex-col gap-y-8 py-4 px-2 md:px-0">
      <div className="flex flex-col gap-y-3">
        <p className="font-semibold text-xl md:text-2xl">
          Invite someone to your group
        </p>
        <DropdownSelect
          options={InviteMode}
          value={inviteMode}
          onChange={([, mode]) => setInviteMode(mode)}
        />

        {inviteMode === InviteMode.NewMember ? (
          <OnetimeInviteForm
            inviteeName={name}
            setInviteeName={setName}
            creatingInvite={creatingInvite}
            onCreateInvite={handleInvite}
            isLeader={true}
          />
        ) : (
          <Card style={CardStyle.Grey}>
            <div className="flex flex-col gap-y-2">
              <p className="font-semibold">
                Invite an existing Alliance member to your group
              </p>
              <p className="text-zinc-500">
                The member will recieve a notification inviting them to join the
                group.
              </p>
              <div className="flex flex-row gap-x-2 mt-2">
                <div className="flex-1">
                  <UserSelect
                    users={selectableUsers}
                    selectedUserIds={selectedUser?.id ? [selectedUser.id] : []}
                    onChange={(userIds) =>
                      setSelectedUser(
                        selectableUsers.find(
                          (user) => user.id === userIds[0]
                        ) ?? null
                      )
                    }
                    label={null}
                    single={true}
                  />
                </div>
              </div>
              <Button
                color={ButtonColor.Black}
                onClick={handleInviteExistingMember}
                disabled={creatingInvite || !selectedUser}
              >
                {creatingInvite ? "Creating invite..." : "Invite"}
              </Button>
            </div>
          </Card>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {onetimeActionable.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <p className="font-semibold text-xl">
            {inviteBuckets.actionable.title}
          </p>
          <List>
            {onetimeActionable.map((request) => (
              <OnetimeInviteListItem
                key={request.id}
                invite={request}
                selfInvited={!!(user && user.id === request.invitingUser?.id)}
                onApprove={onApproveOnetimeInvite}
                onReject={onRejectOnetimeInvite}
              />
            ))}
          </List>
        </div>
      )}

      {communityActionable.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <p className="font-semibold text-xl">
            {inviteBuckets.actionable.title}
          </p>
          <List>
            {communityActionable.map((invite) => (
              <CommunityInviteListItem
                key={invite.id}
                invite={invite}
                selfInvited={!!(user && user.id === invite.invitingUser?.id)}
                onDelete={handleDeleteCommunityInvite}
              />
            ))}
          </List>
        </div>
      )}

      {onetimeUnverifiableActionable.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-col gap-y-1">
            <p className="font-semibold text-xl">
              {inviteBuckets.unverifiableActionable.title}
            </p>
            <p className="text-zinc-500">
              {inviteBuckets.unverifiableActionable.description}
            </p>
          </div>
          <List>
            {onetimeUnverifiableActionable.map((invite) => (
              <OnetimeInviteListItem
                key={invite.id}
                invite={invite}
                selfInvited={!!(user && user.id === invite.invitingUser?.id)}
                onDelete={handleDeleteInvite}
                onCopy={copyToClipboard}
              />
            ))}
          </List>
        </div>
      )}

      {(onetimeWaitingForResponse.length > 0 ||
        communityWaitingForResponse.length > 0) && (
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-col gap-y-1">
            <p className="font-semibold text-xl">
              {inviteBuckets.waitingForResponse.title}
            </p>
            <p className="text-zinc-500">
              {inviteBuckets.waitingForResponse.description}
            </p>
          </div>
          <List>
            {onetimeWaitingForResponse.map((request) => (
              <OnetimeInviteListItem
                key={request.id}
                invite={request}
                selfInvited={!!(user && user.id === request.invitingUser?.id)}
                onDelete={handleDeleteInvite}
              />
            ))}
            {communityWaitingForResponse.map((invite) => (
              <CommunityInviteListItem
                key={invite.id}
                invite={invite}
                selfInvited={!!(user && user.id === invite.invitingUser?.id)}
                onDelete={handleDeleteCommunityInvite}
              />
            ))}
          </List>
        </div>
      )}

      {(onetimeSettled.length > 0 || communitySettled.length > 0) && (
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-col gap-y-1">
            <p className="font-semibold text-xl">
              {inviteBuckets.settled.title}
            </p>
            <p className="text-zinc-500">{inviteBuckets.settled.description}</p>
          </div>
          <List>
            {onetimeSettled.map((invite) => (
              <OnetimeInviteListItem
                key={invite.id}
                invite={invite}
                selfInvited={!!(user && user.id === invite.invitingUser?.id)}
                onCopy={copyToClipboard}
              />
            ))}
            {communitySettled.map((invite) => (
              <CommunityInviteListItem
                key={invite.id}
                invite={invite}
                selfInvited={!!(user && user.id === invite.invitingUser?.id)}
              />
            ))}
          </List>
        </div>
      )}
    </div>
  );
};

export default CommunityInvitesLeaderTab;
