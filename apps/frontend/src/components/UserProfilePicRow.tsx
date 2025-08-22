import { ProfileDto } from "@alliance/shared/client";
import ProfileImage from "./ProfileImage";

const UserProfilePicRow = ({ users }: { users: ProfileDto[] }) => {
  return (
    <div className="flex flex-row items-center gap-x-1">
      {users.slice(0, 5).map((user) => (
        <a
          href={`/user/${user.id}`}
          key={user.id}
          className="flex items-center"
        >
          <ProfileImage pfp={user.profilePicture!} size="small" />
        </a>
      ))}
      {users.length > 5 && (
        <span className="text-sm text-zinc-500">+{users.length - 5} more</span>
      )}
    </div>
  );
};

export default UserProfilePicRow;
