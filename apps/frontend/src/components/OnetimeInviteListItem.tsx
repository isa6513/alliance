import { OnetimeInviteDto } from "@alliance/shared/client";
import { cn } from "@alliance/shared/styles/util";
import { onetimeInviteStatusLabels } from "@alliance/shared/lib/copy";
import AppMarkdownWrapper from "@alliance/sharedweb/ui/AppMarkdownWrapper";
import NewButton, { ButtonColor } from "@alliance/sharedweb/ui/NewButton";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import { Copy as CopyIcon } from "lucide-react";
import { href, Link } from "react-router";

type OnetimeInviteListItemProps = {
  invite: OnetimeInviteDto;
  showCommunityLabel?: boolean;
  communityLabel?: string | null;
  selfInvited: boolean;
  copied?: boolean;
  onCopy?: (code: string) => void;
  onCopied?: (inviteId: number) => void;
  onDelete?: (inviteId: number, event: React.MouseEvent<HTMLElement>) => void;
  onApprove?: (inviteId: number) => void;
  onReject?: (inviteId: number) => void;
};

const STATUS_TEXT_CLASS: Record<
  keyof typeof onetimeInviteStatusLabels,
  string
> = {
  request_pending: "text-amber-500",
  request_rejected: "text-orange-600",
  link_used: "text-zinc-600",
  link_unused: "text-green",
};

const OnetimeInviteListItem = ({
  invite,
  showCommunityLabel,
  communityLabel,
  selfInvited,
  copied = false,
  onCopy,
  onCopied,
  onDelete,
  onApprove,
  onReject,
}: OnetimeInviteListItemProps) => {
  const isRequest = invite.status === "request_pending";
  const statusLabel = onetimeInviteStatusLabels[invite.status];
  const textColorClass = STATUS_TEXT_CLASS[invite.status];
  communityLabel ??= "No group";

  const handleCopy = () => {
    onCopy?.(invite.code);
    onCopied?.(invite.id);
  };

  return (
    <div className="flex flex-col sm:flex-row w-full justify-between p-4">
      <div className="flex flex-col">
        {invite.invitedUserId ? (
          <Link
            to={href("/member/:id", {
              id: invite.invitedUserId.toString(),
            })}
            className="text-lg font-semibold text-zinc-900"
          >
            {invite.invitee}
          </Link>
        ) : (
          <span className="text-lg font-semibold text-zinc-900">
            {invite.invitee}
          </span>
        )}

        {invite.invitingUser && (
          <div className="text-sm flex flex-row items-center gap-x-2">
            {isRequest ? "Requested by" : "Invited by"}
            {selfInvited ? (
              " you"
            ) : (
              <Link
                to={href("/member/:id", {
                  id: invite.invitingUser.id.toString(),
                })}
                className="hover:underline flex flex-row items-center gap-x-1"
              >
                <AvatarProfile
                  pfp={invite.invitingUser.profilePicture}
                  size="mini"
                />
                <span className="font-medium">
                  {invite.invitingUser.displayName}
                </span>
              </Link>
            )}
          </div>
        )}
        {invite.inviteeDescription && (
          <AppMarkdownWrapper
            markdownContent={invite.inviteeDescription}
            className="break-words text-sm text-zinc-400"
          />
        )}
        {invite.info && (
          <AppMarkdownWrapper
            markdownContent={invite.info}
            className="break-words text-sm text-zinc-400"
          />
        )}
      </div>

      <div className="mt-4 sm:mt-0 flex flex-col sm:items-end justify-between sm:gap-2">
        <div className="flex flex-row items-center gap-x-1.5">
          <div className="text-sm font-medium">
            {showCommunityLabel && (
              <span className="text-zinc-400">{communityLabel}</span>
            )}
          </div>
          <span className={cn("text-sm font-semibold", textColorClass)}>
            {statusLabel}
          </span>
        </div>
        <div className="mt-2 flex flex-row items-center sm:justify-end gap-2">
          {isRequest && onApprove && onReject ? (
            <>
              <NewButton
                onClick={() => onApprove(invite.id)}
                color={ButtonColor.Green}
              >
                Approve
              </NewButton>
              <NewButton
                onClick={() => onReject(invite.id)}
                color={ButtonColor.Red}
              >
                Reject
              </NewButton>
            </>
          ) : invite.status === "link_unused" ? (
            <>
              {onCopy && (
                <NewButton
                  color={copied ? ButtonColor.Green : ButtonColor.White}
                  disabled={copied}
                  onClick={handleCopy}
                  iconLeft={!copied && CopyIcon}
                >
                  {copied ? "Copied!" : "Share invite link"}
                </NewButton>
              )}
              {onDelete && (
                <NewButton
                  color={ButtonColor.Black}
                  onClick={(event) => onDelete(invite.id, event)}
                >
                  Delete
                </NewButton>
              )}
            </>
          ) : (
            onDelete &&
            invite.status === "request_pending" && (
              <NewButton
                color={ButtonColor.White}
                onClick={(event) => onDelete(invite.id, event)}
              >
                Cancel
              </NewButton>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default OnetimeInviteListItem;
