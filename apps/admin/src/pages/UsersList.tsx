import {
  analyticsGetTimeSpentPerUser,
  userList,
} from "@alliance/shared/client";
import { TimeSpentForUserDto, User } from "@alliance/shared/client/types.gen";
import React, { useEffect, useState } from "react";
import UserCard from "../components/UserCard";

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [timeSpentPerUser, setTimeSpentPerUser] = useState<
    TimeSpentForUserDto[]
  >([]);

  useEffect(() => {
    analyticsGetTimeSpentPerUser().then((res) => {
      if (res.data) {
        setTimeSpentPerUser(res.data);
      }
    });
  }, []);

  useEffect(() => {
    userList().then((res) => setUsers(res.data || []));
  }, []);

  const userToTimeSpent = timeSpentPerUser.reduce((acc, time) => {
    acc[time.userId] = time.timeSpentLast7Days;
    return acc;
  }, {} as Record<number, number>);

  const sorted = users.sort((a, b) => {
    return (userToTimeSpent[b.id] ?? 0) - (userToTimeSpent[a.id] ?? 0);
  });

  return (
    <div className="h-full p-5 pt-20 flex flex-col items-center gap-y-3">
      {window.location.href.includes("localhost") && (
        <p className="text-sm text-gray-500">note: posthog data is prod-only</p>
      )}
      <div className="flex flex-row flex-wrap gap-3 justify-center">
        {sorted.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            timeSpent={userToTimeSpent[user.id]}
          />
        ))}
      </div>
    </div>
  );
};

export default UsersList;
