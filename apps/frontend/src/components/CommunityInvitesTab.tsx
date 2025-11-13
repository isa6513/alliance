import {
  CreateOnetimeInviteDto,
  OnetimeInviteDto,
  userCreateOnetimeInvite,
  userDeleteOnetimeInvite,
  userGetOnetimeInvitesByCommunity,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import List from "@alliance/shared/ui/List";
import CopyIcon from "@alliance/shared/ui/icons/CopyIcon";
import { getBaseUrl } from "@alliance/shared/lib/config";
import DeleteIcon from "@alliance/shared/ui/icons/DeleteIcon";

export interface CommunityInvitesTabProps {
  communityId: number;
}

const CommunityInvitesTab = ({ communityId }: CommunityInvitesTabProps) => {
  const [name, setName] = useState("");
  const { user } = useAuth();

  const [creatingInvite, setCreatingInvite] = useState(false);

  const [invites, setInvites] = useState<OnetimeInviteDto[]>([]);

  useEffect(() => {
    userGetOnetimeInvitesByCommunity({ path: { communityId } }).then(
      (response) => {
        if (response.data) {
          setInvites(response.data);
        }
      }
    );
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
          setInvites((prev) => [response.data, ...prev]);
        }
      })
      .finally(() => {
        setCreatingInvite(false);
      });
  };

  const handleDeleteInvite = (inviteId: number) => {
    userDeleteOnetimeInvite({ path: { inviteId } }).then((response) => {
      if (response.data) {
        setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
      }
    });
  };
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex flex-col gap-y-1">
        <p className="font-semibold text-xl">Invite someone to the Alliance</p>
        <p className="text-zinc-500">
          This will create a personalized invite page that explains what the
          Alliance is and how to sign up.
        </p>
        <p className="text-zinc-500">
          When the new member signs up, they will automatically be added to your
          group.
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
      </div>

      <div className="flex flex-col gap-y-2">
        <p className="font-semibold text-xl">Past invites</p>
        <List>
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex flex-row gap-x-2 p-4 justify-between items-center"
            >
              <p>{invite.invitee}</p>
              <div className="flex flex-row gap-3 items-center">
                <p className="text-gray-500">{invite.code}</p>
                {invite.isValid ? (
                  <p className="text-green">Active</p>
                ) : (
                  <p className="text-gray-500">used</p>
                )}
                <div
                  className="cursor-pointer active:scale-85 transition-all duration-100 hover:brightness-50"
                  onClick={() => copyToClipboard(invite.code)}
                >
                  <CopyIcon size="medium" fill="gray" />
                </div>
                <div
                  className="cursor-pointer active:scale-85 transition-all duration-100 hover:brightness-50"
                  onClick={() => handleDeleteInvite(invite.id)}
                >
                  <DeleteIcon size="medium" fill="gray" />
                </div>
              </div>
            </div>
          ))}
        </List>
      </div>
    </div>
  );
};

export default CommunityInvitesTab;
