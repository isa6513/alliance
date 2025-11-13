import {
  CommunityInviteDto,
  CreateOnetimeInviteDto,
  OnetimeInviteDto,
  userCreateCommunityInvite,
  userCreateOnetimeInvite,
  userDeleteCommunityInvite,
  userDeleteOnetimeInvite,
  userGetCommunityInvites,
  userGetOnetimeInvitesByCommunity,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import List from "@alliance/shared/ui/List";
import { getBaseUrl } from "@alliance/shared/lib/config";
import UserSelect, {
  UserSelectUser,
  useSelectableUserIds,
} from "@alliance/shared/ui/UserSelect";
import DropdownSelect from "@alliance/shared/ui/DropdownSelect";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import OneTimeInviteListItem from "./OneTimeInviteListItem";
import CommunityInviteListItem from "./CommunityInviteListItem";

export interface CommunityInvitesTabProps {
  communityId: number;
}

export enum InviteMode {
  CurrentMember = "Current Alliance member",
  NewMember = "New member",
}

const CommunityInvitesTab = ({ communityId }: CommunityInvitesTabProps) => {
  const [name, setName] = useState("");
  const { user } = useAuth();

  const [creatingInvite, setCreatingInvite] = useState(false);

  const [newUserInvites, setNewUserInvites] = useState<OnetimeInviteDto[]>([]);
  const [existingMemberInvites, setExistingMemberInvites] = useState<
    CommunityInviteDto[]
  >([]);

  const selectableUsers = useSelectableUserIds();
  const [selectedUser, setSelectedUser] = useState<UserSelectUser | null>(null);

  const [inviteMode, setInviteMode] = useState<InviteMode>(
    InviteMode.CurrentMember
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userGetOnetimeInvitesByCommunity({ path: { communityId } }).then(
      (response) => {
        if (response.data) {
          setNewUserInvites(response.data);
        } else {
          setError("Failed to load new member invites");
        }
      }
    );
    userGetCommunityInvites({ path: { communityId } }).then((response) => {
      if (response.data) {
        setExistingMemberInvites(response.data);
      } else {
        setError("Failed to load existing member invites");
      }
    });
  }, [communityId]);

  const copyToClipboard = (text: string) => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/invite?ref=${text}`;
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
          console.log("Invite created", response.data);
          setName("");
          setNewUserInvites((prev) => [response.data, ...prev]);
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
    userCreateCommunityInvite({
      body: { invitedUserId: selectedUser.id, communityId },
    })
      .then((response) => {
        if (response.data) {
          setExistingMemberInvites((prev) => [response.data, ...prev]);
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

  const handleDeleteInvite = (inviteId: number) => {
    userDeleteOnetimeInvite({ path: { inviteId } }).then((response) => {
      if (response.data) {
        setNewUserInvites((prev) =>
          prev.filter((invite) => invite.id !== inviteId)
        );
      }
    });
  };

  const handleDeleteCommunityInvite = (inviteId: number) => {
    userDeleteCommunityInvite({ path: { inviteId } }).then((response) => {
      if (response.data) {
        setExistingMemberInvites((prev) =>
          prev.filter((invite) => invite.id !== inviteId)
        );
      }
    });
  };

  const combinedInvites = useMemo(() => {
    return [...newUserInvites, ...existingMemberInvites].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [newUserInvites, existingMemberInvites]);

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex flex-col gap-y-1">
        <div className="flex flex-row gap-x-4 justify-start items-center mb-4">
          <p className="font-semibold text-sm">Invite:</p>
          <DropdownSelect
            options={Object.values(InviteMode)}
            value={inviteMode}
            onChange={(mode) => setInviteMode(mode as InviteMode)}
          />
        </div>
        {inviteMode === InviteMode.NewMember ? (
          <Card style={CardStyle.Grey}>
            <p className="font-semibold text-xl">
              Invite someone to the Alliance
            </p>
            <p className="text-zinc-500">
              This will create a personalized invite page that explains what the
              Alliance is and how to sign up.
            </p>
            <p className="text-zinc-500">
              When the new member signs up, they will automatically be added to
              your group.
            </p>
            <div className="flex flex-row gap-x-2 mt-2">
              <input
                type="text"
                className="border border-zinc-300 rounded px-3 h-10 flex-1"
                placeholder="Enter the invitee's first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                color={ButtonColor.Black}
                onClick={handleInvite}
                className="!h-10"
                disabled={creatingInvite || !name}
              >
                {creatingInvite ? "Creating invite..." : "Create invite"}
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <p className="font-semibold text-xl">
              Invite an existing Alliance member to your community
            </p>
            <p className="text-zinc-500">
              This will create a personalized invite page that explains what the
              Alliance is and how to sign up.
            </p>
            <p className="text-zinc-500">
              When the new member signs up, they will automatically be added to
              your group.
            </p>
            <div className="flex flex-row gap-x-2 mt-2">
              <div className="flex-1 max-w-72">
                <UserSelect
                  users={selectableUsers}
                  selectedUserIds={selectedUser?.id ? [selectedUser.id] : []}
                  onChange={(userIds) =>
                    setSelectedUser(
                      selectableUsers.find((user) => user.id === userIds[0]) ??
                        null
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
          </Card>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="flex flex-col gap-y-2">
        <p className="font-semibold text-xl">Past invites</p>
        <List>
          {combinedInvites.map((invite) =>
            "invitee" in invite ? (
              <OneTimeInviteListItem
                key={invite.id}
                invite={invite}
                onDelete={handleDeleteInvite}
                onCopy={copyToClipboard}
              />
            ) : (
              <CommunityInviteListItem
                key={invite.id}
                invite={invite}
                onDelete={handleDeleteCommunityInvite}
              />
            )
          )}
        </List>
      </div>
    </div>
  );
};

export default CommunityInvitesTab;
