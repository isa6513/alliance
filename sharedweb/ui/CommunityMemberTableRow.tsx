import { formatShortDate } from "@alliance/shared/lib/dateFormatters";
import { useCallback, useMemo, useState } from "react";
import { Link, href } from "react-router";
import { cn } from "@alliance/shared/styles/util";
import {
  CommunityMemberContactInfoDto,
  communityRemoveMember,
  ProfileDto,
  UserActionRelationDetailDto,
  UserActionSummaryDto,
  UserAwayRangeDto,
} from "@alliance/shared/client";
import { AvatarProfile } from "./Avatar";
import UserProgressPills from "./UserProgressPills";
import DropdownIcon from "./icons/DropdownIcon";
import UserDisplayName from "./UserDisplayName";
import { formatDistance } from "date-fns";
import Button, { ButtonColor } from "./Button";
import { useToast } from "./ToastProvider";
import InfoTooltip from "./InfoTooltip";

const CommunityMemberTableRow = ({
  profile,
  canExpand = false,
  amLeader,
  canRemove,
  communityId,
  onRemoveMember,
  contactInfo,
  actionRelations,
  actions,
  maxActionsPerWeek,
  deadlineTimestamp,
  showInfoTooltip = false,
}: {
  profile: ProfileDto;
  canExpand?: boolean;
  amLeader?: boolean;
  canRemove?: boolean;
  communityId?: number;
  onRemoveMember?: (memberId: number) => void;
  contactInfo?: CommunityMemberContactInfoDto;
  actions: UserActionSummaryDto[];
  maxActionsPerWeek: Record<number, number> | null;
  actionRelations: UserActionRelationDetailDto[];
  deadlineTimestamp?: number | null;
  showInfoTooltip?: boolean;
}) => {
  const relationByActionId = useMemo(() => {
    return actionRelations.reduce((acc, relation) => {
      acc[relation.actionId] = relation;
      return acc;
    }, {} as Record<number, UserActionRelationDetailDto>);
  }, [actionRelations]);

  const [expanded, setExpanded] = useState(false);
  const sortedAwayRanges = useMemo(() => {
    if (!contactInfo?.awayRanges) {
      return [];
    }
    return [...contactInfo.awayRanges].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [contactInfo?.awayRanges]);

  const currentAwayRange = useMemo(() => {
    const now = new Date();
    return (
      sortedAwayRanges.find((range) => {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        return start <= now && now <= end;
      }) ?? null
    );
  }, [sortedAwayRanges]);

  const upcomingOrCurrentAwayRanges = useMemo(() => {
    const now = new Date();
    return sortedAwayRanges.filter((range) => new Date(range.endDate) >= now);
  }, [sortedAwayRanges]);

  const formatAwayRange = (range: UserAwayRangeDto) => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
  };

  const formatAwayReason = (reason?: string) =>
    reason ? reason.charAt(0).toUpperCase() + reason.slice(1) : "";

  const { confirm } = useToast();

  const handleRemoveMember = useCallback(async (anchor: HTMLElement | null) => {
    if (!communityId) {
      return;
    }
    const ok = await confirm({
      title: "Remove member?",
      message: `Are you sure you want to remove ${profile.displayName} from this group?`,
      confirmLabel: "Yes, remove",
      cancelLabel: "No",
      anchorEl: anchor,
      placement: "topleft",
    });
    if (ok) {
      await communityRemoveMember({
        path: { communityId },
        body: {
          userId: profile.id,
        },
      });
      onRemoveMember?.(profile.id);
    }
  }, []);

  return (
    <>
      <tr
        className={cn(
          "*:py-4 *:px-2 *:md:px-4 bg-white",
          canExpand && "hover:bg-zinc-50 cursor-pointer"
        )}
        onClick={canExpand ? () => setExpanded(!expanded) : undefined}
      >
        <td>
          <div className="flex flex-row items-center gap-x-1 md:gap-x-3">
            {canExpand && (
              <div className={cn(expanded ? "" : "-rotate-90")}>
                <DropdownIcon size="mini" fill="black" />
              </div>
            )}
            <Link
              to={href("/member/:id", { id: profile.id.toString() })}
              className="flex-shrink-0 group flex items-center gap-x-1 md:gap-x-2 mr-3 text-ellipsis overflow-hidden line-clamp-2 wrap-words w-full"
            >
              <div className="hidden md:flex shrink-0 items-center justify-center">
                <AvatarProfile pfp={profile.profilePicture} size="medium" />
              </div>
              <div className="md:hidden shrink-0 flex items-center justify-center">
                <AvatarProfile pfp={profile.profilePicture} size="mini" />
              </div>
              <UserDisplayName
                staff={profile.staff}
                underline={false}
                className={cn(
                  currentAwayRange && "text-zinc-400",
                  "group-hover:underline"
                )}
              >
                {profile.displayName}
                {currentAwayRange && " (away)"}
              </UserDisplayName>
            </Link>
          </div>
        </td>
        <td>
          <div>
            {actions && (
              <UserProgressPills
                actions={actions}
                maxActionsPerWeek={maxActionsPerWeek}
                relationByActionId={relationByActionId}
                pillHeight="h-4"
              />
            )}
          </div>
        </td>
        {amLeader && (
          <>
            <td className="w-px whitespace-nowrap text-sm md:text-base table-cell">
              <p>{contactInfo?.preferredReminderTimeLeaderTz || "Anytime"}</p>
            </td>
            <td className="w-px whitespace-nowrap text-sm md:text-base table-cell">
              {Number.isFinite(deadlineTimestamp ?? Infinity) ? (
                <p>
                  {formatDistance(
                    new Date(deadlineTimestamp ?? Infinity),
                    new Date(),
                    { addSuffix: true }
                  )}
                </p>
              ) : (
                <p className="text-green">Complete</p>
              )}
            </td>
          </>
        )}
      </tr>
      {expanded && (
        <tr>
          <td colSpan={4}>
            <div className="w-full flex flex-row justify-between">
              {!!contactInfo && (
                <div className="px-4 pt-2 pb-6">
                  <div className="flex flex-col gap-y-3">
                    <div className="flex flex-row items-center gap-x-1">
                      <span className="font-semibold">Email:</span>{" "}
                      {contactInfo.email ?? (
                        <>
                          <span className="text-zinc-500">Not provided</span>
                          {showInfoTooltip && (
                            <InfoTooltip
                              content={
                                <p>Email is not shared with the group leader</p>
                              }
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-row items-center gap-x-1">
                      <span className="font-semibold">Phone:</span>{" "}
                      {contactInfo.phoneNumber ?? (
                        <>
                          <span className="text-zinc-500">Not provided</span>
                          {showInfoTooltip && (
                            <InfoTooltip
                              content={
                                <p>
                                  Phone number is not shared with the group
                                  leader
                                </p>
                              }
                            />
                          )}
                        </>
                      )}
                    </div>
                    <p>
                      <span className="font-semibold">Time zone:</span>{" "}
                      {contactInfo.timeZone ?? (
                        <span className="text-zinc-500">Not provided</span>
                      )}
                    </p>
                    {contactInfo.preferredReminderTimeUserTz ===
                    contactInfo.preferredReminderTimeLeaderTz ? (
                      <p>
                        <span className="font-semibold">Contact time:</span>{" "}
                        {contactInfo.preferredReminderTimeUserTz ?? "Anytime"}{" "}
                        in your time zone
                      </p>
                    ) : (
                      <div>
                        <p>
                          <span className="font-semibold">Contact time:</span>
                        </p>
                        <p>
                          {contactInfo.preferredReminderTimeUserTz ?? "Anytime"}
                          <span className="text-zinc-500">
                            {" "}
                            in {profile.displayName}&apos;s time zone
                          </span>
                        </p>
                        <p>
                          {contactInfo.preferredReminderTimeLeaderTz ??
                            "Anytime"}
                          <span className="text-zinc-500">
                            {" "}
                            in your time zone
                          </span>
                        </p>
                      </div>
                    )}
                    {!!upcomingOrCurrentAwayRanges.length && (
                      <div className="flex flex-col gap-y-2 border-t border-zinc-200 pt-3">
                        <p className="font-semibold">Away ranges</p>
                        <div className="flex flex-col gap-y-2 text-sm text-zinc-700">
                          {upcomingOrCurrentAwayRanges.map((range) => (
                            <div
                              key={range.id}
                              className="flex flex-col gap-y-0.5"
                            >
                              <p>
                                {formatAwayRange(range)}
                                {currentAwayRange?.id === range.id
                                  ? " (current)"
                                  : ""}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {formatAwayReason(range.reason)}
                                {range.note ? ` — ${range.note}` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col justify-end m-4">
                {canRemove && communityId && (
                  <Button
                    color={ButtonColor.Red}
                    onClick={(event) =>
                      void handleRemoveMember(event.currentTarget)
                    }
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default CommunityMemberTableRow;
