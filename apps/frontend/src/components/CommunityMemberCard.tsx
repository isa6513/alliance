import {
  ProfileDto,
  UserActionRelationDetailDto,
  UserActionSummaryDto,
  UserDto,
} from "@alliance/shared/client";
import UserDisplayName from "./UserDisplayName";
import { useMemo } from "react";
import UserProgressPills from "@alliance/shared/ui/UserProgressPills";

const CommunityMemberCard = ({
  profile,
  user,
  actionRelations,
  actions,
}: {
  profile: ProfileDto;
  user?: UserDto;
  actions?: UserActionSummaryDto[];
  actionRelations: UserActionRelationDetailDto[];
}) => {
  const relationByActionId = useMemo(() => {
    return actionRelations.reduce((acc, relation) => {
      acc[relation.actionId] = relation;
      return acc;
    }, {} as Record<number, UserActionRelationDetailDto>);
  }, [actionRelations]);

  return (
    <div key={profile.id} className="p-4 flex flex-row items-center gap-x-2">
      <UserDisplayName staff={profile.staff} underline={false}>
        {profile.displayName}
      </UserDisplayName>
      {!!user && (
        <>
          <div className="text-sm text-zinc-500 bg-zinc-100 py-1 px-2 rounded">
            {user.email}
          </div>
          <UserProgressPills
            actions={actions!}
            relationByActionId={relationByActionId}
          />
        </>
      )}
    </div>
  );
};

export default CommunityMemberCard;
