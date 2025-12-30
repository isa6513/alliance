import {
  RequestOnetimeInviteDto,
  OnetimeInviteDto,
  userDeleteOnetimeInvite,
  userGetOnetimeInvitesByRequester,
  userRequestOnetimeInvite,
} from "@alliance/shared/client";
import { getBaseUrl } from "@alliance/sharedweb/lib/config";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import Card from "@alliance/sharedweb/ui/Card";
import List from "@alliance/sharedweb/ui/List";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import OneTimeInviteRequestMemberListItem from "./OneTimeInviteRequestMemberListItem";
import OneTimeInviteMemberListItem from "./OneTimeInviteMemberListItem";
import { CardStyle } from "@alliance/shared/styles/card";

export interface CommunityInvitesTabMemberProps {
  communityId: number;
}

const CommunityInvitesTabMember = ({
  communityId,
}: CommunityInvitesTabMemberProps) => {
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [inviteeName, setInviteeName] = useState("");
  const [inviteeDescription, setInviteeDescription] = useState("");
  const [creatingRequest, setCreatingInvite] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<OnetimeInviteDto[]>(
    []
  );
  const { error: errorToast, confirm } = useToast();
  const [invites, setInvites] = useState<OnetimeInviteDto[]>([]);
  const descriptionInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const descriptionInput = descriptionInputRef.current;
    if (!descriptionInput) {
      return;
    }
    descriptionInput.style.height = "auto";
    descriptionInput.style.height = descriptionInput.scrollHeight + "px";
  }, [inviteeDescription, descriptionInputRef]);

  useEffect(() => {
    userGetOnetimeInvitesByRequester({ path: { communityId } }).then(
      (response) => {
        if (response.data) {
          setPendingRequests(
            response.data
              .filter((request) => request.status === "request_pending")
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
          );
        } else {
          setError("Failed to load new member invites");
        }
      }
    );
    userGetOnetimeInvitesByRequester({ path: { communityId } }).then(
      (response) => {
        if (response.data) {
          setInvites(response.data);
        } else {
          setError("Failed to load new member invites");
        }
      }
    );
  }, [communityId]);

  const copyToClipboard = (text: string) => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/signup?ref=${text}`;
    navigator.clipboard.writeText(url);
  };

  const handleDeleteInvite = (
    inviteId: number,
    e: React.MouseEvent<HTMLElement>
  ) => {
    (async () => {
      const ok = await confirm({
        message: "Are you sure you want to delete this invite?",
        confirmLabel: "Yes, delete it!",
        cancelLabel: "No, keep it",
        anchorEl: e.currentTarget,
        placement: "topleft",
      });
      if (!ok) {
        return;
      }

      userDeleteOnetimeInvite({ path: { inviteId } }).then((response) => {
        if (!response.error) {
          setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
        }
      });
    })();
  };

  const handleRequest = () => {
    if (!user) {
      return;
    }
    setCreatingInvite(true);
    const body = {
      invitee: inviteeName,
      inviteeDescription,
      communityId,
      invitingUserId: user.id,
    } satisfies RequestOnetimeInviteDto;

    userRequestOnetimeInvite({ body })
      .then((response) => {
        if (response.data) {
          setInviteeName("");
          setInviteeDescription("");
          setPendingRequests((prev) => [response.data, ...prev]);
          setError(null);
        }
      })
      .finally(() => {
        setCreatingInvite(false);
      });
  };

  const handleDeleteRequest = (inviteId: number) => {
    userDeleteOnetimeInvite({ path: { inviteId } }).then((response) => {
      if (response.response.ok) {
        setPendingRequests((prev) =>
          prev.filter((request) => request.id !== inviteId)
        );
      } else {
        errorToast(`Failed to delete request: ${response.response.statusText}`);
      }
    });
  };

  const pendingInvites = useMemo(
    () => invites.filter((invite) => invite.status === "link_unused"),
    [invites]
  );
  const usedInvites = useMemo(
    () => invites.filter((invite) => invite.status === "link_used"),
    [invites]
  );

  return (
    <div className="flex flex-col gap-y-8 py-4">
      <div className="flex flex-col gap-y-3">
        <p className="font-semibold text-xl md:text-2xl">
          Invite someone to your group
        </p>
        {
          <Card style={CardStyle.Grey}>
            <div className="flex flex-col gap-y-2">
              <p className="font-semibold">
                Invite a new member to the Alliance and your group
              </p>
              <ol className="text-zinc-500 list-decimal list-inside mb-2">
                <li>
                  A group lead will first need to approve the request for the
                  invitee.
                </li>
                <li>
                  Once approved, you will receive a personalized invite link
                  that you can share with the invitee.
                </li>
                <li>
                  When the invitee signs up, they will automatically be added to
                  your group.
                </li>
              </ol>
              <input
                type="text"
                className="border border-zinc-300 rounded px-3 py-2 bg-white"
                placeholder="Enter the invitee's first name"
                value={inviteeName}
                onChange={(e) => setInviteeName(e.target.value)}
              />
              <textarea
                ref={descriptionInputRef}
                className="border border-zinc-300 rounded px-3 py-2 bg-white overflow-hidden"
                placeholder="Context about invitee"
                value={inviteeDescription}
                onChange={(e) => {
                  setInviteeDescription(e.target.value);
                }}
                rows={2}
                style={{ resize: "none" }}
              />
              <Button
                color={ButtonColor.Black}
                onClick={handleRequest}
                className="!h-10"
                disabled={
                  creatingRequest || !inviteeDescription || !inviteeName
                }
              >
                {creatingRequest ? "Creating request..." : "Send request"}
              </Button>
            </div>
          </Card>
        }
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {pendingRequests.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <p className="font-semibold text-xl">Pending requests</p>
          <List>
            {pendingRequests.map((request) => (
              <OneTimeInviteRequestMemberListItem
                key={request.id}
                request={request}
                onDelete={handleDeleteRequest}
              />
            ))}
          </List>
        </div>
      )}

      {pendingInvites.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <p className="font-semibold text-xl">Approved invites</p>
          <p className="text-gray-500">
            {'Click "Share" to copy the link and send it to the invitee.'}
          </p>
          <List>
            {pendingInvites.map((invite) => (
              <OneTimeInviteMemberListItem
                key={invite.id}
                invite={invite}
                onCopy={(id) => copyToClipboard(id)}
                onDelete={handleDeleteInvite}
              />
            ))}
          </List>
        </div>
      )}

      {usedInvites.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <p className="font-semibold text-xl">Past invites</p>
          <List>
            {usedInvites.map((invite) => (
              <OneTimeInviteMemberListItem
                key={invite.id}
                invite={invite}
                onCopy={(id) => copyToClipboard(id)}
                onDelete={handleDeleteInvite}
              />
            ))}
          </List>
        </div>
      )}
    </div>
  );
};

export default CommunityInvitesTabMember;
