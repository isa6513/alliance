import { ProfileDto } from "@alliance/shared/client";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import { Link } from "react-router";
import ProfileImage from "./ProfileImage";
import UserDisplayName from "./UserDisplayName";

export interface MembersListCardProps {
  profile: ProfileDto;
}

export default function MembersListCard({ profile }: MembersListCardProps) {
  return (
    <Link to={`/user/${profile.id}`}>
      <Card
        style={CardStyle.White}
        className="min-w-[200px] hover:border-zinc-400 transition-all duration-30 w-full gap-y-3 h-32"
      >
        <div className="flex flex-row items-center">
          <ProfileImage
            pfp={profile.profilePicture}
            size="large"
            className="mr-3"
          />
          <UserDisplayName staff={profile.staff}>
            {profile.displayName}
          </UserDisplayName>
        </div>
        {profile.profileDescription && (
          <p className="text-zinc-800 overflow-hidden">
            {profile.profileDescription}
          </p>
        )}
      </Card>
    </Link>
  );
}
