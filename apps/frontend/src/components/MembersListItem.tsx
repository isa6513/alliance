import { ProfileDto } from "@alliance/shared/client";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { Link } from "react-router";
import UserDisplayName from "./UserDisplayName";

export interface MembersListCardProps {
  profile: ProfileDto;
}

export default function MembersListItem({ profile }: MembersListCardProps) {
  return (
    <Link to={`/user/${profile.id}`} className="p-4 hover:bg-zinc-50">
      <div className="flex flex-row items-center">
        <ProfileImage
          pfp={profile.profilePicture}
          size="large"
          className="mr-3"
        />
        <UserDisplayName staff={profile.staff} underline={false}>
          {profile.displayName}
        </UserDisplayName>
      </div>
    </Link>
  );
}
