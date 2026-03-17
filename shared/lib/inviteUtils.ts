import type { CommunityInviteDto, OnetimeInviteDto } from "../client";

/** Optional callbacks for invite list/section actions; pass a single object to simplify props. */
export type OnetimeInviteActions = {
  onApprove?: (inviteId: number) => void;
  onReject?: (inviteId: number) => void;
  onDelete?: (inviteId: number, event: unknown) => void;
  onDeleteWithConfirm?: (inviteId: number, event: unknown) => void;
  onShared?: (inviteId: number) => void;
};

const createdAtComparator = (
  a: { createdAt: string },
  b: { createdAt: string }
) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export function bucketOnetimeInvitesByActionability(params: {
  invites: OnetimeInviteDto[];
  leaderCommunityIds: Set<number>;
  userId: number;
}): {
  actionable: OnetimeInviteDto[];
  unverifiableActionable: OnetimeInviteDto[];
  waitingForResponse: OnetimeInviteDto[];
  settled: OnetimeInviteDto[];
} {
  const { invites, leaderCommunityIds, userId } = params;

  const actionable: OnetimeInviteDto[] = [];
  const unverifiableActionable: OnetimeInviteDto[] = [];
  const waitingForResponse: OnetimeInviteDto[] = [];
  const settled: OnetimeInviteDto[] = [];

  for (const invite of invites) {
    switch (invite.status) {
      case "link_used":
      case "request_rejected":
        settled.push(invite);
        break;
      case "request_pending":
        if (
          invite.community?.id &&
          leaderCommunityIds.has(invite.community.id)
        ) {
          actionable.push(invite);
        } else {
          waitingForResponse.push(invite);
        }
        break;
      case "link_unused":
        if (invite.invitingUser?.id === userId) {
          unverifiableActionable.push(invite);
        } else {
          waitingForResponse.push(invite);
        }
        break;
      default:
        throw new Error(
          `Unknown invite status: ${invite.status satisfies never}`
        );
    }
  }

  return {
    actionable: actionable.sort(createdAtComparator),
    unverifiableActionable: unverifiableActionable.sort(createdAtComparator),
    waitingForResponse: waitingForResponse.sort(createdAtComparator),
    settled: settled.sort(createdAtComparator),
  };
}

export function bucketCommunityInvitesByActionability(params: {
  invites: CommunityInviteDto[];
  userId: number;
}): {
  actionable: CommunityInviteDto[];
  waitingForResponse: CommunityInviteDto[];
  settled: CommunityInviteDto[];
} {
  const { invites, userId } = params;

  const actionable: CommunityInviteDto[] = [];
  const waitingForResponse: CommunityInviteDto[] = [];
  const settled: CommunityInviteDto[] = [];

  for (const invite of invites) {
    switch (invite.status) {
      case "cancelled":
      case "invitee_rejected":
      case "invitee_accepted":
      case "request_rejected":
        settled.push(invite);
        break;
      case "invitee_pending":
        waitingForResponse.push(invite);
        break;
      case "request_pending":
        if (invite.invitingUser?.id === userId) {
          waitingForResponse.push(invite);
        } else {
          actionable.push(invite);
        }
        break;
      default:
        throw new Error(
          `Unknown invite status: ${invite.status satisfies never}`
        );
    }
  }

  return {
    actionable: actionable.sort(createdAtComparator),
    waitingForResponse: waitingForResponse.sort(createdAtComparator),
    settled: settled.sort(createdAtComparator),
  };
}
