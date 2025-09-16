import {
  analyticsGetTimeSpentPerUser,
  analyticsGetTimeSpentPerUserTotal,
  userList,
} from "@alliance/shared/client";
import { TimeSpentForUserDto, User } from "@alliance/shared/client/types.gen";
import React, { useEffect, useState } from "react";
import UserCard from "../components/UserCard";

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [timeSpentPerUserLast7, setTimeSpentPerUserLast7] = useState<
    TimeSpentForUserDto[]
  >([]);
  const [timeSpentPerUserTotal, setTimeSpentPerUserTotal] = useState<
    TimeSpentForUserDto[]
  >([]);
  useEffect(() => {
    analyticsGetTimeSpentPerUser().then((res) => {
      if (res.data) {
        setTimeSpentPerUserLast7(res.data);
      }
    });
    analyticsGetTimeSpentPerUserTotal().then((res) => {
      if (res.data) {
        setTimeSpentPerUserTotal(res.data);
      }
    });
  }, []);

  useEffect(() => {
    userList().then((res) => setUsers(res.data || []));
  }, []);

  const userToTimeSpent = timeSpentPerUserLast7.reduce((acc, time) => {
    acc[time.userId] = time.timeSpent;
    return acc;
  }, {} as Record<number, number>);

  const userToTimeSpentTotal = timeSpentPerUserTotal.reduce((acc, time) => {
    acc[time.userId] = time.timeSpent;
    return acc;
  }, {} as Record<number, number>);

  const sorted = users.sort((a, b) => {
    return (
      (userToTimeSpentTotal[b.id] ?? 0) - (userToTimeSpentTotal[a.id] ?? 0)
    );
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
            timeSpentTotal={userToTimeSpentTotal[user.id]}
          />
        ))}
      </div>
    </div>
  );
};

export default UsersList;
