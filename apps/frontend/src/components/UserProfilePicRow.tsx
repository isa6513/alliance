import { ProfileDto } from "@alliance/shared/client";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { useState } from "react";

const UserProfilePicRow = ({ users }: { users: ProfileDto[] }) => {
  const unique = users;

  const [expanded, setExpanded] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setExpanded(!expanded);
    e.stopPropagation();
  };

  return (
    <div
      className="flex flex-row items-center gap-x-0.5 flex-wrap"
      onClick={handleClick}
    >
      {(expanded ? unique : unique.slice(0, 5)).map((user) => (
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
      {users.length > 5 && !expanded && (
        <span className="text-sm text-zinc-500">+{users.length - 5} more</span>
      )}
    </div>
  );
};

export default UserProfilePicRow;
