import { ProfileDto } from "@alliance/shared/client";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { useState } from "react";

const UserProfilePicRow = ({ users }: { users: ProfileDto[] }) => {
  const unique = users.filter(function (item, pos, self) {
    return self.findIndex((t) => t.id === item.id) === pos;
  });

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
        <ProfileImage pfp={user.profilePicture!} size="small" key={user.id} />
      ))}
      {users.length > 5 && !expanded && (
        <span className="text-sm text-zinc-500">+{users.length - 5} more</span>
      )}
    </div>
  );
};

export default UserProfilePicRow;
