import {
  CommunityMemberContactInfoDto,
  ProfileDto,
  UserActionRelationDetailDto,
  UserActionSummaryDto,
} from "@alliance/shared/client";
import UserDisplayName from "./UserDisplayName";
import { useMemo, useState } from "react";
import UserProgressPills from "@alliance/shared/ui/UserProgressPills";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import DropdownIcon from "@alliance/shared/ui/icons/DropdownIcon";
import CheckIcon from "@alliance/shared/ui/icons/CheckIcon";

const CommunityMemberCard = ({
  profile,
  contactInfo,
  actionRelations,
  actions,
  canExpand = false,
  completedAllCurrentActions = false,
}: {
  profile: ProfileDto;
  contactInfo?: CommunityMemberContactInfoDto;
  actions?: UserActionSummaryDto[];
  actionRelations: UserActionRelationDetailDto[];
  canExpand?: boolean;
  completedAllCurrentActions?: boolean;
}) => {
  const relationByActionId = useMemo(() => {
    return actionRelations.reduce((acc, relation) => {
      acc[relation.actionId] = relation;
      return acc;
    }, {} as Record<number, UserActionRelationDetailDto>);
  }, [actionRelations]);

  const [expanded, setExpanded] = useState(false);

  return (
    <div key={profile.id} className="p-4 flex flex-col gap-y-2">
      <div className="flex flex-row items-center gap-x-2">
        <div className="min-w-[50%] flex flex-row items-center gap-x-3">
          {canExpand && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`${expanded ? "" : "-rotate-90"}`}
            >
              <DropdownIcon size="mini" fill="black" />
            </button>
          )}
          <ProfileImage pfp={profile.profilePicture} size="medium" />
          <UserDisplayName staff={profile.staff} underline={false}>
            {profile.displayName}
          </UserDisplayName>
          {completedAllCurrentActions && <CheckIcon size="mini" />}
        </div>
        <div className="flex-1 mx-2">
          {!!actions && (
            <UserProgressPills
              actions={actions}
              relationByActionId={relationByActionId}
            />
          )}
        </div>
      </div>
      {expanded && (
        <div>
          {!!contactInfo && (
            <Card
              style={CardStyle.Grey}
              className="flex flex-row justify-between"
            >
              <div className="flex flex-col gap-y-3">
                <p>
                  <b>Email:</b> {contactInfo.email}
                </p>
                <p>
                  <b>Phone:</b>{" "}
                  {contactInfo.phoneNumber ?? (
                    <span className="text-zinc-500">Not provided</span>
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-y-3">
                <p>
                  Time Zone:{" "}
                  {contactInfo.timeZone ?? (
                    <span className="text-zinc-500">Not provided</span>
                  )}
                </p>
                {contactInfo.preferredReminderTimeUserTz ===
                contactInfo.preferredReminderTimeLeaderTz ? (
                  <p>
                    Preferred Contact Time:{" "}
                    {contactInfo.preferredReminderTimeUserTz}
                  </p>
                ) : (
                  <div>
                    <p>Preferred Contact Time:</p>
                    <p>
                      {contactInfo.preferredReminderTimeUserTz}
                      <span className="text-zinc-500">
                        {" "}
                        in {profile.displayName}&apos;s time zone
                      </span>
                    </p>
                    <p>
                      {contactInfo.preferredReminderTimeLeaderTz}
                      <span className="text-zinc-500"> in your time zone</span>
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityMemberCard;
