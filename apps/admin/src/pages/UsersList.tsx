import React from "react";
import UserList from "../components/UserList";

const UsersList: React.FC = () => {
  return (
    <div className="flex-1 overflow-hidden h-full">
      <UserList />
    </div>
  );
};

export default UsersList;