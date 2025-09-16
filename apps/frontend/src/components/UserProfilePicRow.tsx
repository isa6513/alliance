import { ProfileDto } from "@alliance/shared/client";
import ProfileImage from "@alliance/shared/ui/ProfileImage";

const UserProfilePicRow = ({ users }: { users: ProfileDto[] }) => {
  const unique = users.filter(function (item, pos, self) {
    return self.findIndex((t) => t.id === item.id) === pos;
  });
  return (
    <div className="flex flex-row items-center gap-x-0.5">
      {unique.slice(0, 5).map((user) => (
        <a
          href={`/user/${user.id}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
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
