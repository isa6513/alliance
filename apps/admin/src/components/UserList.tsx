import { useEffect, useState } from "react";
import { User } from "@alliance/shared/client/types.gen";
import { userList } from "@alliance/shared/client";
import UserCard from "./UserCard";

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    userList().then((res) => setUsers(res.data || []));
  }, []);

  return (
    <div className="flex flex-row flex-wrap gap-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};

export default UserList;
